import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { JOIN_REQUEST_STATUS, USER_ROLE, NOTIFICATION_TYPE } from "@/lib/prisma-enums";
import { notifyUser } from "@/lib/notifications";

// Warga (provisional) mengajukan bergabung ke sebuah RT aktif.
export const POST = handle(async (req) => {
  const session = await getSessionLike();
  if (!session?.profileId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { rtId, fullName, address, note } = await req.json();
  if (!rtId || !fullName || !address) {
    return Response.json({ error: "rtId, fullName, address wajib" }, { status: 422 });
  }

  const rt = await prisma.rT.findUnique({ where: { id: rtId } });
  if (!rt) return Response.json({ error: "RT tidak ditemukan" }, { status: 404 });
  if (!rt.isActive) return Response.json({ error: "Wilayah belum aktif" }, { status: 409 });

  // Cegah duplikat pengajuan pending.
  const dup = await prisma.joinRequest.findFirst({
    where: { userId: session.profileId, rtId, status: JOIN_REQUEST_STATUS.PENDING },
  });
  if (dup) return Response.json(dup);

  const jr = await prisma.joinRequest.create({
    data: {
      userId: session.profileId,
      rtId,
      fullName: String(fullName).trim(),
      address: String(address).trim(),
      note: note ? String(note).trim() : null,
      status: JOIN_REQUEST_STATUS.PENDING,
    },
  });

  // Simpan alamat di profil agar siap dipakai pickup nanti.
  await prisma.userProfile.update({
    where: { id: session.profileId },
    data: { address: String(address).trim() },
  }).catch(() => {});

  // Beri tahu Ketua RT (ADMIN_RT) wilayah tsb.
  const ketua = await prisma.userProfile.findFirst({
    where: { rtId, role: USER_ROLE.ADMIN_RT },
    select: { userId: true },
  });
  if (ketua?.userId) {
    await notifyUser(ketua.userId, {
      title: "Pengajuan anggota baru 👋",
      body: `${String(fullName).trim()} ingin bergabung ke RT ${rt.number}.`,
      type: NOTIFICATION_TYPE.ANNOUNCEMENT,
      refId: jr.id,
      url: "/admin/pengajuan",
    }).catch(() => {});
  }

  return Response.json(jr, { status: 201 });
});
