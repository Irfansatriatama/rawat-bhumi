// Domain helper untuk fitur Belajar.
// Kategori tampilan, jalur belajar, bank soal quiz, tips, dan statistik turunan.
// Catatan: progres/sertifikat/streak BELUM punya model DB tersendiri — di sini
// diturunkan secara deterministik dari sinyal nyata (PointHistory, totalPoints,
// jumlah materi terbit) agar angka stabil & masuk akal sampai model progres ada.

import {
  Leaf, Trash2, Recycle, TriangleAlert, BookOpen, Split, Sprout, Boxes,
  type LucideIcon,
} from "lucide-react";
import { CONTENT_CATEGORY } from "@/lib/prisma-enums";

export type Tone = "green" | "amber" | "teal" | "lime" | "red" | "slate";

/** 4 kategori tampilan di grid "Kategori Belajar" (mengelompokkan CONTENT_CATEGORY). */
export type BelajarCategory = {
  key: string;
  label: string;
  icon: LucideIcon;
  tone: Tone;
  cats: string[]; // CONTENT_CATEGORY yang masuk grup ini
};

export const BELAJAR_CATEGORIES: BelajarCategory[] = [
  {
    key: "kebiasaan",
    label: "Kebiasaan Lestari",
    icon: Leaf,
    tone: "green",
    cats: [CONTENT_CATEGORY.LINGKUNGAN],
  },
  {
    key: "pengelolaan",
    label: "Pengelolaan Sampah",
    icon: Trash2,
    tone: "teal",
    cats: [CONTENT_CATEGORY.PILAH_SAMPAH, CONTENT_CATEGORY.RESIDU, CONTENT_CATEGORY.ANORGANIK],
  },
  {
    key: "daur-ulang",
    label: "Daur Ulang & Kompos",
    icon: Recycle,
    tone: "green",
    cats: [CONTENT_CATEGORY.ORGANIK, CONTENT_CATEGORY.MAGGOT_BSF],
  },
  {
    key: "b3",
    label: "B3 & E-Waste",
    icon: TriangleAlert,
    tone: "amber",
    cats: [CONTENT_CATEGORY.B3],
  },
];

export function categoryByKey(key: string): BelajarCategory | undefined {
  return BELAJAR_CATEGORIES.find((c) => c.key === key);
}

/** Label ramah untuk tiap CONTENT_CATEGORY (dipakai di kartu materi). */
export const CONTENT_CATEGORY_LABEL: Record<string, string> = {
  [CONTENT_CATEGORY.PILAH_SAMPAH]: "Pilah Sampah",
  [CONTENT_CATEGORY.ORGANIK]: "Organik",
  [CONTENT_CATEGORY.ANORGANIK]: "Anorganik",
  [CONTENT_CATEGORY.RESIDU]: "Residu",
  [CONTENT_CATEGORY.B3]: "B3 & E-Waste",
  [CONTENT_CATEGORY.MAGGOT_BSF]: "Maggot BSF",
  [CONTENT_CATEGORY.LINGKUNGAN]: "Lingkungan",
};

/** Jalur Belajar Untuk Pemula — 5 tahap berurutan. */
export type PathStep = {
  no: number;
  label: string;
  icon: LucideIcon;
  categoryKey: string; // grup kategori tujuan
  desc: string;
};

export const LEARNING_PATH: PathStep[] = [
  { no: 1, label: "Paham Sampah", icon: BookOpen, categoryKey: "kebiasaan", desc: "Kenali jenis & dampak sampah di sekitarmu." },
  { no: 2, label: "Pemilahan Sampah", icon: Split, categoryKey: "pengelolaan", desc: "Pilah organik, anorganik, residu, dan B3 dengan benar." },
  { no: 3, label: "Daur Ulang Sampah", icon: Recycle, categoryKey: "daur-ulang", desc: "Ubah anorganik jadi barang bernilai kembali." },
  { no: 4, label: "Kompos & Organik", icon: Sprout, categoryKey: "daur-ulang", desc: "Olah sisa makanan jadi kompos & pakan maggot." },
  { no: 5, label: "Kelola & Aksi", icon: Boxes, categoryKey: "kebiasaan", desc: "Terapkan kebiasaan lestari sehari-hari." },
];

/** Tips singkat "Tahukah Kamu?". */
export const TIPS: string[] = [
  "Sampah organik yang diolah dengan benar bisa menjadi kompos yang bermanfaat untuk menyuburkan tanah.",
  "Memilah sampah dari rumah membuat 60% lebih banyak material berhasil didaur ulang.",
  "Satu kilogram maggot BSF mampu mengurai hingga 2 kg sampah organik per hari.",
  "Baterai bekas termasuk limbah B3 — jangan dibuang ke tempat sampah biasa.",
  "Botol plastik PET yang bersih dan kering punya nilai jual daur ulang paling tinggi.",
  "Mengurangi sampah plastik sekali pakai bisa memangkas emisi karbon rumah tangga secara nyata.",
];

// ============================================================
// QUIZ — bank soal Level Dasar (skor dihitung di client).
// ============================================================
export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number; // index opsi benar
  explain: string;
};

export const QUIZ_DASAR: QuizQuestion[] = [
  {
    q: "Kulit pisang dan sisa sayur termasuk kategori sampah apa?",
    options: ["Organik", "Anorganik", "Residu", "B3"],
    answer: 0,
    explain: "Sisa makanan & bahan alami mudah terurai → sampah organik, cocok untuk kompos.",
  },
  {
    q: "Botol plastik bekas air minum sebaiknya masuk ke tempat sampah…",
    options: ["Organik", "Anorganik", "Residu", "B3"],
    answer: 1,
    explain: "Plastik PET bisa didaur ulang, jadi masuk kategori anorganik.",
  },
  {
    q: "Manakah yang termasuk limbah B3?",
    options: ["Daun kering", "Kertas koran", "Baterai bekas", "Kardus"],
    answer: 2,
    explain: "Baterai mengandung bahan berbahaya & beracun (B3), perlu penanganan khusus.",
  },
  {
    q: "Langkah pertama mengelola sampah di rumah adalah…",
    options: ["Membakar", "Memilah", "Menimbun", "Membuang ke sungai"],
    answer: 1,
    explain: "Memilah dari sumber adalah kunci agar sampah bisa diolah lanjut.",
  },
  {
    q: "Maggot BSF biasanya dipakai untuk mengolah sampah…",
    options: ["Anorganik", "B3", "Organik", "Residu"],
    answer: 2,
    explain: "Larva BSF (maggot) mengurai sampah organik jadi pakan & pupuk.",
  },
  {
    q: "Popok sekali pakai yang sudah kotor umumnya digolongkan sebagai…",
    options: ["Organik", "Anorganik", "Residu", "Bisa dikompos"],
    answer: 2,
    explain: "Popok bekas sulit didaur ulang maupun dikompos → masuk residu.",
  },
  {
    q: "Hasil akhir dari pengomposan sampah organik adalah…",
    options: ["Plastik daur ulang", "Kompos/pupuk", "Bahan bakar B3", "Kaca"],
    answer: 1,
    explain: "Kompos menyuburkan tanah dan mengurangi sampah ke TPA.",
  },
  {
    q: "Sebelum dibuang, kemasan plastik sebaiknya…",
    options: ["Dibiarkan kotor", "Dibilas & dikeringkan", "Dibakar", "Dicampur organik"],
    answer: 1,
    explain: "Kemasan bersih & kering punya nilai daur ulang lebih tinggi.",
  },
  {
    q: "Lampu neon bekas termasuk kategori…",
    options: ["Organik", "Residu", "B3", "Anorganik"],
    answer: 2,
    explain: "Lampu neon mengandung merkuri → limbah B3.",
  },
  {
    q: "Prinsip 3R dalam pengelolaan sampah adalah…",
    options: ["Reduce, Reuse, Recycle", "Read, Run, Rest", "Reduce, Run, Recycle", "Reuse, Read, Recycle"],
    answer: 0,
    explain: "Reduce (kurangi), Reuse (pakai ulang), Recycle (daur ulang).",
  },
];

// ============================================================
// STATISTIK TURUNAN (sementara, tanpa model progres khusus)
// ============================================================
export type BelajarStats = {
  materiSelesai: number;
  sertifikat: number;
  streak: number; // hari belajar berturut-turut
  poin: number;
};

/**
 * Progres turunan dari poin nyata & jumlah materi (sementara, belum ada model progres).
 * Dipakai konsisten di halaman Belajar & halaman Jalur.
 */
export function deriveProgress(poin: number, totalContents: number) {
  const pathLen = LEARNING_PATH.length;
  const materiSelesai = Math.min(totalContents, Math.floor(poin / 20));
  const sertifikat = Math.floor(materiSelesai / 3);
  const pathDone = Math.min(pathLen, Math.max(materiSelesai > 0 ? 1 : 0, Math.floor(materiSelesai / 2)));
  const pathPct = Math.round((pathDone / pathLen) * 100);
  return { materiSelesai, sertifikat, pathDone, pathPct };
}

/**
 * Hitung streak hari berturut-turut dari daftar tanggal aktivitas (mis. PointHistory).
 * Beruntun mundur dari hari ini; jeda 1 hari memutus streak.
 */
export function hitungStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const days = new Set(
    dates.map((d) => {
      const x = new Date(d);
      return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
    }),
  );
  let streak = 0;
  const cursor = new Date();
  // toleransi: jika belum ada aktivitas hari ini, mulai hitung dari kemarin
  const key = (x: Date) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
  if (!days.has(key(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(key(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
