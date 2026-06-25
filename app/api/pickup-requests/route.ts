import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { PICKUP_STATUS } from "@/lib/prisma-enums";

// Warga konfirmasi hadir pada sebuah jadwal → buat PickupRequest.
export const POST = handle(async (req) => {
  const session = await getSessionLike();
  if (!session?.profileId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { scheduleId } = await req.json();
  if (!scheduleId) return Response.json({ error: "scheduleId wajib" }, { status: 422 });

  const profile = await prisma.userProfile.findUnique({ where: { id: session.profileId } });
  const schedule = await prisma.pickupSchedule.findUnique({ where: { id: scheduleId } });
  if (!schedule) return Response.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });

  const existing = await prisma.pickupRequest.findFirst({
    where: { userId: session.profileId, scheduleId },
  });
  if (existing) return Response.json(existing);

  const request = await prisma.pickupRequest.create({
    data: {
      userId: session.profileId,
      scheduleId,
      status: PICKUP_STATUS.CONFIRMED,
      address: profile?.address ?? "-",
    },
  });
  return Response.json(request, { status: 201 });
});
