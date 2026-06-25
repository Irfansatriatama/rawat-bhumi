import { prisma } from "./db";
import { ENTRY_TYPE } from "./prisma-enums";
import { esgNarrative } from "./gemini";

/** Hitung agregat ESG untuk satu periode "YYYY-MM". */
export async function computeEsgData(period: string) {
  const [y, m] = period.split("-").map(Number);
  const start = new Date(y, (m ?? 1) - 1, 1);
  const end = new Date(y, m ?? 1, 1);

  const recs = await prisma.wasteRecord.findMany({ where: { recordedAt: { gte: start, lt: end } } });
  const sumG = (k: "organikGrams" | "anorganikGrams" | "residuGrams" | "b3Grams") =>
    recs.reduce((a, b) => a + (b[k] || 0), 0);

  const organikKg = sumG("organikGrams") / 1000;
  const anorganikKg = sumG("anorganikGrams") / 1000;
  const residuKg = sumG("residuGrams") / 1000;
  const b3Kg = sumG("b3Grams") / 1000;
  const totalWeightKg = organikKg + anorganikKg + residuKg + b3Kg;
  const co2ReducedKg = recs.reduce((a, b) => a + b.co2ReducedKg, 0);
  const activeKK = new Set(recs.map((r) => r.userId)).size;
  const ksatriaCount = await prisma.ksatriaProfile.count();

  const rev = await prisma.revenueEntry.findMany({ where: { period } });
  const revenueTotal = rev.filter((r) => r.type === ENTRY_TYPE.REVENUE).reduce((a, b) => a + b.amount, 0);
  const costTotal = rev.filter((r) => r.type === ENTRY_TYPE.COST).reduce((a, b) => a + b.amount, 0);

  return { period, totalWeightKg, organikKg, anorganikKg, residuKg, b3Kg, co2ReducedKg, activeKK, ksatriaCount, revenueTotal, costTotal };
}

export async function generateESGReport(period: string, generatedBy: string) {
  const data = await computeEsgData(period);
  const narrative = await esgNarrative({
    period,
    totalWeightKg: data.totalWeightKg,
    organikKg: data.organikKg,
    anorganikKg: data.anorganikKg,
    residuKg: data.residuKg,
    co2ReducedKg: data.co2ReducedKg,
    activeKK: data.activeKK,
    revenueTotal: data.revenueTotal,
  });
  return prisma.eSGReport.create({ data: { ...data, narrative, generatedBy } });
}
