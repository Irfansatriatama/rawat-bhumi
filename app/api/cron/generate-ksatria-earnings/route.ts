import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { assertCron } from "@/lib/cron";
import { currentPeriod } from "@/lib/format";
import { calcKsatriaEarning } from "@/lib/business-rules";

export const GET = handle(async (req) => {
  assertCron(req);
  const period = currentPeriod();
  const [y, m] = period.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const ksatrias = await prisma.ksatriaProfile.findMany();
  let processed = 0;

  for (const k of ksatrias) {
    const recs = await prisma.wasteRecord.findMany({
      where: { ksatriaId: k.id, recordedAt: { gte: start, lt: end } },
      select: { totalGrams: true },
    });
    const totalGrams = recs.reduce((a, b) => a + b.totalGrams, 0);
    const e = calcKsatriaEarning(recs.length, totalGrams);

    const existing = await prisma.ksatriaEarning.findFirst({ where: { ksatriaId: k.id, period } });
    const data = {
      pickupCount: recs.length,
      totalWeight: totalGrams,
      baseAmount: e.baseAmount,
      bonusAmount: e.bonusAmount,
      totalAmount: e.totalAmount,
    };
    if (existing) await prisma.ksatriaEarning.update({ where: { id: existing.id }, data });
    else await prisma.ksatriaEarning.create({ data: { ksatriaId: k.id, period, ...data } });
    processed++;
  }
  return Response.json({ period, ksatria: processed });
});
