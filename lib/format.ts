export function rupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function tanggal(d: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(d));
}

export function tanggalJam(d: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));
}

/** Waktu relatif singkat (id-ID): "Baru saja", "5 mnt lalu", "3 jam lalu", "Kemarin", lalu tanggal. */
export function waktuRelatif(d: Date | string, now: number = Date.now()): string {
  const t = new Date(d).getTime();
  const diff = now - t;
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} mnt lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari === 1) return "Kemarin";
  if (hari < 7) return `${hari} hari lalu`;
  return tanggal(d);
}

export function kg(grams: number): string {
  return (grams / 1000).toFixed(2);
}

export function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const TIME_SLOTS = ["06:00 - 08:00", "08:00 - 10:00", "10:00 - 12:00", "15:00 - 17:00"];
