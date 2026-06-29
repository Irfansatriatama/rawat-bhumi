// Sertifikat Dampak bulanan warga — dihitung dari agregat WasteRecord per periode.
// Tanpa model baru: sertifikat = view turunan data nyata (idempoten, selalu sinkron).
import { prisma } from "./db";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** "2026-06" → "Juni 2026". */
export function periodLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return `${BULAN[(m ?? 1) - 1]} ${y}`;
}

function periodOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export type CertSummary = {
  period: string;
  label: string;
  totalKg: number;
  co2Kg: number;
  pickupCount: number;
  isCurrent: boolean; // periode berjalan (belum "terbit" final)
};

export type CertData = CertSummary & {
  organikKg: number;
  anorganikKg: number;
  residuKg: number;
  b3Kg: number;
  points: number;
};

type Row = {
  recordedAt: Date;
  totalGrams: number;
  organikGrams: number;
  anorganikGrams: number;
  residuGrams: number;
  b3Grams: number;
  co2ReducedKg: number;
};

async function rowsByPeriod(profileId: string): Promise<Map<string, Row[]>> {
  const recs = await prisma.wasteRecord.findMany({
    where: { userId: profileId },
    select: {
      recordedAt: true, totalGrams: true,
      organikGrams: true, anorganikGrams: true, residuGrams: true, b3Grams: true,
      co2ReducedKg: true,
    },
    orderBy: { recordedAt: "desc" },
  });
  const map = new Map<string, Row[]>();
  for (const r of recs) {
    const p = periodOf(r.recordedAt);
    (map.get(p) ?? map.set(p, []).get(p)!).push(r);
  }
  return map;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Daftar periode yang punya sertifikat (urut terbaru dulu). */
export async function listCertificates(profileId: string): Promise<CertSummary[]> {
  const map = await rowsByPeriod(profileId);
  const cur = periodOf(new Date());
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([period, rows]) => ({
      period,
      label: periodLabel(period),
      totalKg: round1(rows.reduce((s, r) => s + r.totalGrams, 0) / 1000),
      co2Kg: round1(rows.reduce((s, r) => s + r.co2ReducedKg, 0)),
      pickupCount: rows.length,
      isCurrent: period === cur,
    }));
}

/** Detail satu sertifikat (null bila tak ada data di periode itu). */
export async function getCertificate(profileId: string, period: string): Promise<CertData | null> {
  const map = await rowsByPeriod(profileId);
  const rows = map.get(period);
  if (!rows || rows.length === 0) return null;

  const sum = (f: (r: Row) => number) => rows.reduce((s, r) => s + f(r), 0);
  const points = await prisma.pointHistory.aggregate({
    _sum: { points: true },
    where: {
      userId: profileId,
      points: { gt: 0 },
      createdAt: {
        gte: new Date(Number(period.split("-")[0]), Number(period.split("-")[1]) - 1, 1),
        lt: new Date(Number(period.split("-")[0]), Number(period.split("-")[1]), 1),
      },
    },
  });

  return {
    period,
    label: periodLabel(period),
    totalKg: round1(sum((r) => r.totalGrams) / 1000),
    co2Kg: round1(sum((r) => r.co2ReducedKg)),
    pickupCount: rows.length,
    isCurrent: period === periodOf(new Date()),
    organikKg: round1(sum((r) => r.organikGrams) / 1000),
    anorganikKg: round1(sum((r) => r.anorganikGrams) / 1000),
    residuKg: round1(sum((r) => r.residuGrams) / 1000),
    b3Kg: round1(sum((r) => r.b3Grams) / 1000),
    points: points._sum.points ?? 0,
  };
}
