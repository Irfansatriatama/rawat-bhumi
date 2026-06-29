import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { JOIN_REQUEST_STATUS, USER_ROLE, NOTIFICATION_TYPE } from "@/lib/prisma-enums";
import { notifyUser } from "@/lib/notifications";

const ADMIN_ROLES: string[] = [USER_ROLE.ADMIN_RT, USER_ROLE.ADMIN_KELURAHAN, USER_ROLE.SUPER_ADMIN];

// Ketua RT menyetujui / menolak pengajuan bergabung.
export const PATCH = handle(async (req, ctx) => {
  const session = await getSessionLike();
  if (!session?.profileId || !ADMIN_ROLES.includes(session.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params!;
  const { action } = await req.json();
  if (action !== "approve" && action !== "reject") {
    return Response.json({ error: "action harus approve|reject" }, { status: 422 });
  }

  const jr = await prisma.joinRequest.findUnique({ where: { id } });
  if (!jr) return Response.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
  if (jr.status !== JOIN_REQUEST_STATUS.PENDING) {
    return Response.json({ error: "Pengajuan sudah diproses" }, { status: 409 });
  }

  const warga = await prisma.userProfile.findUnique({ where: { id: jr.userId }, select: { userId: true } });
  const rt = await prisma.rT.findUnique({ where: { id: jr.rtId } });

  if (action === "approve") {
    await prisma.$transaction([
      prisma.joinRequest.update({
        where: { id },
        data: { status: JOIN_REQUEST_STATUS.APPROVED, decidedById: session.profileId, decidedAt: new Date() },
      }),
      prisma.userProfile.update({
        where: { id: jr.userId },
        data: { rtId: jr.rtId, isProvisional: false, isActive: true },
      }),
    ]);
    if (warga?.userId) {
      await notifyUser(warga.userId, {
        title: "Pengajuan disetujui 🎉",
        body: `Selamat! Kamu resmi bergabung di RT ${rt?.number ?? ""}. Selamat datang di komunitas.`,
        type: NOTIFICATION_TYPE.JOIN_APPROVED,
        refId: jr.id,
        url: "/onboarding/selamat-datang",
      }).catch(() => {});
    }
  } else {
    await prisma.joinRequest.update({
      where: { id },
      data: { status: JOIN_REQUEST_STATUS.REJECTED, decidedById: session.profileId, decidedAt: new Date() },
    });
    if (warga?.userId) {
      await notifyUser(warga.userId, {
        title: "Pengajuan belum disetujui",
        body: "Hubungi Ketua RT untuk informasi lebih lanjut, atau cari komunitas lain.",
        type: NOTIFICATION_TYPE.JOIN_REJECTED,
        refId: jr.id,
        url: "/onboarding/komunitas",
      }).catch(() => {});
    }
  }

  return Response.json({ ok: true, status: action === "approve" ? "APPROVED" : "REJECTED" });
});
