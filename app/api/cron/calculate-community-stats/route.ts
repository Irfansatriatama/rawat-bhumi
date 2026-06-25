import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { assertCron } from "@/lib/cron";
import { currentPeriod } from "@/lib/format";

export const GET = handle(async (req) => {
  assertCron(req);
  const period = currentPeriod();
  const [y, m] = period.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const recs = await prisma.wasteRecord.findMany({
    where: { recordedAt: { gte: start, lt: end } },
    select: { userId: true, totalGrams: true, co2ReducedKg: true },
  });
  const profiles = await prisma.userProfile.findMany({
    where: { id: { in: recs.map((r) => r.userId) } },
    select: { id: true, rtId: true },
  });
  const rtByProfile = new Map(profiles.map((p) => [p.id, p.rtId]));

  const agg = new Map<string, { kk: Set<string>; grams: number; co2: number }>();
  for (const r of recs) {
    const rt = rtByProfile.get(r.userId);
    if (!rt) continue;
    const a = agg.get(rt) ?? { kk: new Set(), grams: 0, co2: 0 };
    a.kk.add(r.userId);
    a.grams += r.totalGrams;
    a.co2 += r.co2ReducedKg;
    agg.set(rt, a);
  }

  let upserts = 0;
  for (const [rtId, a] of agg) {
    await prisma.communityStats.upsert({
      where: { rtId_period: { rtId, period } },
      update: { activeKK: a.kk.size, totalWeightKg: a.grams / 1000, totalCo2Kg: a.co2 },
      create: { rtId, period, activeKK: a.kk.size, totalWeightKg: a.grams / 1000, totalCo2Kg: a.co2 },
    });
    upserts++;
  }
  return Response.json({ period, rts: upserts });
});
