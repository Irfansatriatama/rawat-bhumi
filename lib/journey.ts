// "Perjalanan Sampah" — siklus nyata setoran warga, diturunkan dari data:
//   Dijemput (Ksatria) → Dipilah (timbang) → Diangkut → Diolah (mitra hilir) → Produk baru
// Tahap 1–2 bersifat personal (setoran warga sendiri); tahap 3–5 mengikuti
// aliran komunitas/RT bulan ini (sampah individu melebur jadi satu arus hilir).
import { prisma } from "./db";
import { currentPeriod } from "./format";
import { PICKUP_STATUS, ENTRY_TYPE, DELIVERY_STATUS, REVENUE_SOURCE } from "./prisma-enums";

export type JourneyStageKey = "dijemput" | "dipilah" | "diangkut" | "diolah" | "produk";

export type JourneyStage = {
  key: JourneyStageKey;
  label: string;
  desc: string;
  scope: "personal" | "komunitas";
  done: boolean;
  active: boolean;
  at: Date | null;
  meta: string | null;
};

export type WasteJourney = {
  stages: JourneyStage[];
  activeIndex: number; // 0..5 (5 = seluruh siklus selesai)
  hasBatch: boolean;
  totalKg: number;
  ksatriaName: string | null;
  partnerName: string | null;
  summary: string;
};

const PRODUCT_LABEL: Record<string, string> = {
  [REVENUE_SOURCE.MAGGOT]: "Maggot BSF",
  [REVENUE_SOURCE.PUPUK]: "Pupuk kompos",
  [REVENUE_SOURCE.CACAHAN_PLASTIK]: "Cacahan plastik",
};

async function ksatriaNameById(ksatriaId: string): Promise<string | null> {
  const kp = await prisma.ksatriaProfile.findUnique({ where: { id: ksatriaId }, select: { userId: true } });
  if (!kp) return null;
  const up = await prisma.userProfile.findUnique({ where: { id: kp.userId }, select: { userId: true } });
  if (!up) return null;
  const u = await prisma.user.findUnique({ where: { id: up.userId }, select: { name: true } });
  return u?.name ?? null;
}

export async function getWasteJourney(profileId: string): Promise<WasteJourney> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [latestRecord, latestRequest, deliveryCount, latestDelivery, productRev] = await Promise.all([
    prisma.wasteRecord.findFirst({ where: { userId: profileId }, orderBy: { recordedAt: "desc" } }),
    prisma.pickupRequest.findFirst({ where: { userId: profileId }, orderBy: { createdAt: "desc" } }),
    prisma.wasteDelivery.count({ where: { deliveryDate: { gte: monthStart } } }),
    prisma.wasteDelivery.findFirst({ where: { deliveryDate: { gte: monthStart } }, orderBy: { deliveryDate: "desc" }, include: { partner: true } }),
    prisma.revenueEntry.findFirst({
      where: { period: currentPeriod(), type: ENTRY_TYPE.REVENUE, deliveryId: { not: null } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const ksatriaName = latestRecord?.ksatriaId ? await ksatriaNameById(latestRecord.ksatriaId) : null;
  const totalKg = latestRecord ? latestRecord.totalGrams / 1000 : 0;
  const partnerName = latestDelivery?.partner.name ?? null;
  const productLabel = productRev ? PRODUCT_LABEL[productRev.source] ?? "Produk daur ulang" : null;

  const picked = !!latestRecord || latestRequest?.status === PICKUP_STATUS.COMPLETED;
  const weighed = !!latestRecord;
  const d = [
    picked, // dijemput
    weighed, // dipilah
    weighed && deliveryCount > 0, // diangkut
    weighed && deliveryCount > 0 && (productRev !== null || latestDelivery?.status === DELIVERY_STATUS.RECEIVED), // diolah
    weighed && productRev !== null, // produk baru
  ];

  const pickedAt = latestRecord?.recordedAt ?? latestRequest?.confirmedAt ?? null;
  const stagesDef: Omit<JourneyStage, "done" | "active">[] = [
    { key: "dijemput", label: "Dijemput", scope: "personal", desc: "Ksatria Bhumi menjemput sampah terpilah dari rumahmu.", at: pickedAt, meta: ksatriaName ? `oleh ${ksatriaName}` : null },
    { key: "dipilah", label: "Dipilah", scope: "personal", desc: "Sampah ditimbang & dipisah: organik, anorganik, residu, B3.", at: latestRecord?.recordedAt ?? null, meta: weighed ? `${totalKg.toFixed(1)} kg tercatat` : null },
    { key: "diangkut", label: "Diangkut", scope: "komunitas", desc: "Sampah RT diangkut menuju mitra pengolah sesuai jenisnya.", at: latestDelivery?.deliveryDate ?? null, meta: partnerName ? `menuju ${partnerName}` : null },
    { key: "diolah", label: "Diolah", scope: "komunitas", desc: "Organik jadi maggot/pupuk, anorganik dicacah, residu & B3 ke mitra berizin.", at: latestDelivery?.deliveryDate ?? null, meta: partnerName },
    { key: "produk", label: "Produk baru", scope: "komunitas", desc: "Lahir produk baru bernilai — menutup siklus ekonomi sirkular.", at: productRev?.createdAt ?? null, meta: productLabel },
  ];

  let activeIndex = d.findIndex((x) => !x);
  if (activeIndex === -1) activeIndex = d.length; // semua selesai

  const stages: JourneyStage[] = stagesDef.map((s, i) => ({ ...s, done: d[i], active: i === activeIndex }));

  let summary: string;
  if (!latestRecord && !latestRequest) summary = "Belum ada setoran. Jadwalkan penjemputan pertamamu.";
  else if (activeIndex === 0) summary = "Menunggu penjemputan oleh Ksatria Bhumi.";
  else if (activeIndex === 1) summary = "Sampahmu sedang dipilah & ditimbang per kategori.";
  else if (activeIndex === 2) summary = "Sampah diangkut menuju mitra pengolah.";
  else if (activeIndex === 3) summary = partnerName ? `Sedang diolah di ${partnerName}.` : "Sampah sedang diolah mitra hilir.";
  else if (activeIndex === 4) summary = "Hampir jadi produk baru (kompos/maggot/cacahan).";
  else summary = "Siklus selesai — sampahmu kini jadi produk baru. 🎉";

  return {
    stages,
    activeIndex,
    hasBatch: !!latestRecord,
    totalKg,
    ksatriaName,
    partnerName,
    summary,
  };
}
