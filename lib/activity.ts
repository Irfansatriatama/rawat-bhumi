// Aktivitas pilah harian warga.
// Status tiap kategori = manual (DailySortLog, hasil tap) ATAU
// auto (ada WasteRecord untuk kategori itu di hari yang sama).
import { prisma } from "./db";
import { WASTE_CATEGORY } from "./prisma-enums";

export const SORT_CATEGORIES = [
  { key: WASTE_CATEGORY.ORGANIK, label: "Organik" },
  { key: WASTE_CATEGORY.ANORGANIK, label: "Anorganik" },
  { key: WASTE_CATEGORY.RESIDU, label: "Residu" },
  { key: WASTE_CATEGORY.B3, label: "B3 & E-Waste" },
] as const;

export type SortCategoryKey = (typeof SORT_CATEGORIES)[number]["key"];

// Field gram di WasteRecord untuk tiap kategori (deteksi "auto").
const GRAMS_FIELD = {
  [WASTE_CATEGORY.ORGANIK]: "organikGrams",
  [WASTE_CATEGORY.ANORGANIK]: "anorganikGrams",
  [WASTE_CATEGORY.RESIDU]: "residuGrams",
  [WASTE_CATEGORY.B3]: "b3Grams",
} as const;

/** Kunci hari lokal "YYYY-MM-DD". */
export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isSortCategory(key: string): key is SortCategoryKey {
  return SORT_CATEGORIES.some((c) => c.key === key);
}

function dayBounds(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return { start: new Date(y, m - 1, d, 0, 0, 0, 0), end: new Date(y, m - 1, d, 23, 59, 59, 999) };
}

type GramsRow = { organikGrams: number; anorganikGrams: number; residuGrams: number; b3Grams: number };
function autoCategories(rec: GramsRow, into: Set<string>) {
  for (const c of SORT_CATEGORIES) if (rec[GRAMS_FIELD[c.key]] > 0) into.add(c.key);
}

export type CategoryState = { key: SortCategoryKey; label: string; manual: boolean; auto: boolean; done: boolean };

/** Status 4 kategori untuk satu hari (default: hari ini). */
export async function getDayActivity(profileId: string, key = dayKey()): Promise<CategoryState[]> {
  const { start, end } = dayBounds(key);
  const [logs, recs] = await Promise.all([
    prisma.dailySortLog.findMany({ where: { userId: profileId, date: key }, select: { category: true } }),
    prisma.wasteRecord.findMany({
      where: { userId: profileId, recordedAt: { gte: start, lte: end } },
      select: { organikGrams: true, anorganikGrams: true, residuGrams: true, b3Grams: true },
    }),
  ]);
  const manual = new Set(logs.map((l) => l.category));
  const auto = new Set<string>();
  recs.forEach((r) => autoCategories(r, auto));
  return SORT_CATEGORIES.map((c) => {
    const m = manual.has(c.key);
    const a = auto.has(c.key);
    return { key: c.key, label: c.label, manual: m, auto: a, done: m || a };
  });
}

export type DayHistory = {
  date: string;
  states: { key: SortCategoryKey; label: string; manual: boolean; auto: boolean; done: boolean }[];
  doneCount: number;
};

/** Riwayat N hari terakhir (terbaru dulu). */
export async function getActivityHistory(profileId: string, days = 30): Promise<DayHistory[]> {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1), 0, 0, 0, 0);
  const [logs, recs] = await Promise.all([
    prisma.dailySortLog.findMany({
      where: { userId: profileId, date: { gte: dayKey(startDate) } },
      select: { date: true, category: true },
    }),
    prisma.wasteRecord.findMany({
      where: { userId: profileId, recordedAt: { gte: startDate } },
      select: { recordedAt: true, organikGrams: true, anorganikGrams: true, residuGrams: true, b3Grams: true },
    }),
  ]);

  const manualByDay = new Map<string, Set<string>>();
  for (const l of logs) {
    (manualByDay.get(l.date) ?? manualByDay.set(l.date, new Set()).get(l.date)!).add(l.category);
  }
  const autoByDay = new Map<string, Set<string>>();
  for (const r of recs) {
    const k = dayKey(new Date(r.recordedAt));
    const set = autoByDay.get(k) ?? autoByDay.set(k, new Set()).get(k)!;
    autoCategories(r, set);
  }

  const out: DayHistory[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const k = dayKey(d);
    const m = manualByDay.get(k) ?? new Set<string>();
    const a = autoByDay.get(k) ?? new Set<string>();
    const states = SORT_CATEGORIES.map((c) => {
      const manual = m.has(c.key);
      const auto = a.has(c.key);
      return { key: c.key, label: c.label, manual, auto, done: manual || auto };
    });
    out.push({ date: k, states, doneCount: states.filter((s) => s.done).length });
  }
  return out;
}
