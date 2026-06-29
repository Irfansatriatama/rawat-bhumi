// Aturan bisnis & angka default pilot Rawat Bhumi.
// ⚠️ Semua angka di bawah adalah DEFAULT yang masuk akal untuk pilot —
//    konfirmasi/validasi dengan tim & pedoman resmi sebelum dipakai di
//    laporan ESG final. Diletakkan terpusat agar gampang di-tuning.

import { WASTE_CATEGORY } from "./prisma-enums";

// ---- POIN WARGA ----
export const POINTS = {
  PER_PICKUP: 10, // poin per pickup selesai
  PER_100G_ORGANIK: 1, // +1 poin tiap 100 gram organik (insentif pilah organik)
} as const;

// ---- ESTIMASI CO2 (kg CO2e dihindari per kg sampah) ----
// PLACEHOLDER — validasi dengan pedoman IPCC / DLH DKI sebelum laporan resmi.
//  ORGANIK   : metana TPA yang dicegah (fermentasi → maggot/pupuk)
//  ANORGANIK : emisi produksi plastik virgin yang dihindari via daur ulang
//  RESIDU/B3 : tidak dihitung sebagai pengurang (0)
export const CO2_FACTOR_KG_PER_KG: Record<string, number> = {
  [WASTE_CATEGORY.ORGANIK]: 1.0,
  [WASTE_CATEGORY.ANORGANIK]: 1.5,
  [WASTE_CATEGORY.RESIDU]: 0,
  [WASTE_CATEGORY.B3]: 0,
};

// ---- PENGHASILAN KSATRIA (target +Rp 1,5–2 jt/bln) ----
// Sanity check pilot: ~150 KK × ~4 siklus = ~600 pickup/bln → base Rp1,2jt
//   + bonus berat (~1,6 ton/bln × Rp200/kg ≈ Rp330rb) ≈ Rp1,5jt.
export const KSATRIA_RATE = {
  BASE_PER_PICKUP: 2000, // Rp per pickup
  BONUS_PER_KG: 200, // Rp per kg total terangkut
} as const;

type Grams = {
  organikGrams: number;
  anorganikGrams: number;
  residuGrams: number;
  b3Grams: number;
};

export function calcTotalGrams(g: Grams): number {
  return g.organikGrams + g.anorganikGrams + g.residuGrams + g.b3Grams;
}

export function calcPointsEarned(g: Grams): number {
  const organikBonus = Math.floor(g.organikGrams / 100) * POINTS.PER_100G_ORGANIK;
  return POINTS.PER_PICKUP + organikBonus;
}

export function calcCo2ReducedKg(g: Grams): number {
  const f = CO2_FACTOR_KG_PER_KG;
  const kg = (grams: number) => grams / 1000;
  const co2 =
    kg(g.organikGrams) * f.ORGANIK +
    kg(g.anorganikGrams) * f.ANORGANIK +
    kg(g.residuGrams) * f.RESIDU +
    kg(g.b3Grams) * f.B3;
  return Math.round(co2 * 1000) / 1000; // 3 desimal
}

export function calcKsatriaEarning(pickupCount: number, totalGrams: number) {
  const baseAmount = pickupCount * KSATRIA_RATE.BASE_PER_PICKUP;
  const bonusAmount = Math.round((totalGrams / 1000) * KSATRIA_RATE.BONUS_PER_KG);
  return { baseAmount, bonusAmount, totalAmount: baseAmount + bonusAmount };
}

// ---- CEK KESIAPAN SAMPAH (self-assessment, fondasi WSSPR) ----
// Skor = persentase kategori yang sudah terpilah dari 4 kategori.
// ≥75 Siap · 50–74 Cukup · <50 Perlu belajar. Pickup TIDAK PERNAH ditolak;
// skor di bawah standar memicu nudge edukasi (Learning Loop).
export const READINESS = { SIAP: 75, CUKUP: 50 } as const;

export type ReadinessFlags = {
  organik: boolean;
  anorganik: boolean;
  residu: boolean;
  b3: boolean;
};

export function calcReadinessScore(f: ReadinessFlags): number {
  const done = [f.organik, f.anorganik, f.residu, f.b3].filter(Boolean).length;
  return Math.round((done / 4) * 100);
}

export type ReadinessLevel = "SIAP" | "CUKUP" | "BELAJAR";

export function readinessLevel(score: number): ReadinessLevel {
  if (score >= READINESS.SIAP) return "SIAP";
  if (score >= READINESS.CUKUP) return "CUKUP";
  return "BELAJAR";
}

export function readinessLabel(score: number): string {
  const l = readinessLevel(score);
  return l === "SIAP" ? "Siap pickup" : l === "CUKUP" ? "Cukup" : "Perlu belajar";
}
