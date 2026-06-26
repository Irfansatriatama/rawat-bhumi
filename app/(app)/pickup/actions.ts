"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { SCHEDULE_STATUS, PICKUP_STATUS } from "@/lib/prisma-enums";

// Status request yang masih "berjalan" → masih relevan untuk Ksatria, jadi disinkron.
const OPEN_STATUSES: string[] = [
  PICKUP_STATUS.PENDING,
  PICKUP_STATUS.CONFIRMED,
  PICKUP_STATUS.ON_THE_WAY,
  PICKUP_STATUS.ARRIVED,
];

/**
 * Simpan Informasi Pickup. Sumber kebenaran default ada di UserProfile
 * (address / pickupInstruction / pickupNote) — dipakai sebagai nilai awal &
 * di-snapshot saat warga konfirmasi jadwal. Jika ada pickup yang masih berjalan,
 * snapshot-nya ikut diperbarui supaya perubahan langsung terlihat Ksatria.
 */
export async function updatePickupInfo(data: {
  address: string;
  instruction: string;
  note: string;
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const address = data.address.trim();
  const instruction = data.instruction.trim();
  const note = data.note.trim();

  const profile = await prisma.userProfile.update({
    where: { userId: session.user.id },
    data: {
      address: address || null,
      pickupInstruction: instruction || null,
      pickupNote: note || null,
    },
    select: { id: true, rtId: true },
  });

  // Sinkronkan pickup yang masih berjalan pada jadwal aktif RT warga.
  if (profile.rtId) {
    const schedule = await prisma.pickupSchedule.findFirst({
      where: {
        rtId: profile.rtId,
        status: { in: [SCHEDULE_STATUS.SCHEDULED, SCHEDULE_STATUS.IN_PROGRESS] },
      },
      orderBy: { scheduledDate: "asc" },
      select: { id: true },
    });
    if (schedule) {
      await prisma.pickupRequest.updateMany({
        where: { userId: profile.id, scheduleId: schedule.id, status: { in: OPEN_STATUSES } },
        data: {
          address: address || "-",
          instruction: instruction || null,
          notes: note || null,
        },
      });
    }
  }

  revalidatePath("/pickup");
  revalidatePath("/akun");
  revalidatePath("/akun/alamat");
  revalidatePath("/ksatria/tugas");
  revalidatePath("/ksatria/beranda");
  return { success: true };
}
