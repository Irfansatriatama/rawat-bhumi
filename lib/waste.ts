import { prisma } from "./db";
import { calcTotalGrams, calcPointsEarned, calcCo2ReducedKg } from "./business-rules";
import { PICKUP_STATUS, POINT_TYPE, SYNC_STATUS, NOTIFICATION_TYPE } from "./prisma-enums";
import { sendPushToUser } from "./push";

export type WasteInput = {
  pickupRequestId: string;
  ksatriaProfileId: string;
  organikGrams: number;
  anorganikGrams: number;
  residuGrams: number;
  b3Grams: number;
  weightPhotoUrl?: string | null;
  overrideReason?: string | null;
  syncStatus?: string;
};

/**
 * Catat timbangan: buat WasteRecord, tandai PickupRequest COMPLETED,
 * hitung poin & CO2, catat PointHistory, tambah totalPoints warga.
 * Semua dalam satu transaksi (penting karena no-FK → konsistensi di app level).
 */
export async function createWasteRecord(input: WasteInput) {
  const req = await prisma.pickupRequest.findUnique({ where: { id: input.pickupRequestId } });
  if (!req) throw new Response("Pickup request tidak ditemukan", { status: 404 });

  const grams = {
    organikGrams: input.organikGrams,
    anorganikGrams: input.anorganikGrams,
    residuGrams: input.residuGrams,
    b3Grams: input.b3Grams,
  };
  const totalGrams = calcTotalGrams(grams);
  const pointsEarned = calcPointsEarned(grams);
  const co2ReducedKg = calcCo2ReducedKg(grams);

  const wr = await prisma.$transaction(async (tx) => {
    const record = await tx.wasteRecord.create({
      data: {
        pickupRequestId: input.pickupRequestId,
        userId: req.userId,
        ksatriaId: input.ksatriaProfileId,
        ...grams,
        totalGrams,
        co2ReducedKg,
        pointsEarned,
        weightPhotoUrl: input.weightPhotoUrl ?? null,
        overrideReason: input.overrideReason ?? null,
        syncStatus: input.syncStatus ?? SYNC_STATUS.SYNCED,
      },
    });
    await tx.pickupRequest.update({
      where: { id: input.pickupRequestId },
      data: { status: PICKUP_STATUS.COMPLETED, confirmedAt: new Date() },
    });
    await tx.pointHistory.create({
      data: {
        userId: req.userId,
        points: pointsEarned,
        type: POINT_TYPE.PICKUP_COMPLETED,
        description: `Pickup selesai (+${pointsEarned} poin)`,
        refId: record.id,
      },
    });
    await tx.userProfile.update({
      where: { id: req.userId },
      data: { totalPoints: { increment: pointsEarned } },
    });
    await tx.notification.create({
      data: {
        userId: req.userId,
        title: "Pickup selesai 🎉",
        body: `Sampahmu tercatat ${(totalGrams / 1000).toFixed(2)} kg. +${pointsEarned} poin!`,
        type: NOTIFICATION_TYPE.POINTS_EARNED,
        refId: record.id,
      },
    });
    return record;
  });

  // Best-effort Web Push ke warga (di luar transaksi).
  const profile = await prisma.userProfile.findUnique({
    where: { id: req.userId },
    select: { userId: true },
  });
  if (profile?.userId) {
    await sendPushToUser(profile.userId, {
      title: "Pickup selesai 🎉",
      body: `+${pointsEarned} poin · ${(totalGrams / 1000).toFixed(2)} kg`,
      url: "/akun/poin",
      refId: wr.id,
    }).catch(() => {});
  }
  return wr;
}
