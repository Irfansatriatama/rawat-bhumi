import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { USER_ROLE, NOTIFICATION_TYPE } from "@/lib/prisma-enums";
import { notifyUser } from "@/lib/notifications";

const ADMIN_ROLES: string[] = [USER_ROLE.ADMIN_RT, USER_ROLE.ADMIN_KELURAHAN, USER_ROLE.SUPER_ADMIN];

// Aktivasi Wilayah (Founding Member): Ketua RT/operator menyalakan wilayah saat
// target KK tercapai → semua pelopor jadi anggota aktif + dapat notifikasi.
export const POST = handle(async (req, ctx) => {
  const session = await getSessionLike();
  if (!session?.profileId || !ADMIN_ROLES.includes(session.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params!;

  const rt = await prisma.rT.findUnique({ where: { id } });
  if (!rt) return Response.json({ error: "RT tidak ditemukan" }, { status: 404 });
  if (rt.isActive) return Response.json({ ok: true, alreadyActive: true });

  await prisma.rT.update({ where: { id }, data: { isActive: true, activatedAt: new Date() } });

  // Pelopor → anggota aktif.
  const members = await prisma.userProfile.findMany({ where: { rtId: id }, select: { id: true, userId: true } });
  await prisma.userProfile.updateMany({ where: { rtId: id }, data: { isProvisional: false } });

  for (const m of members) {
    await notifyUser(m.userId, {
      title: "Wilayahmu aktif! 🌱",
      body: `RT ${rt.number} resmi aktif. Jadwal penjemputan akan segera tersedia.`,
      type: NOTIFICATION_TYPE.COMMUNITY_ACTIVATED,
      url: "/beranda",
    }).catch(() => {});
  }

  return Response.json({ ok: true, members: members.length });
});
