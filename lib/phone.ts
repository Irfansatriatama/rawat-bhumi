// Util nomor HP — murni (tanpa prisma), aman dipakai di client & server.

/** Normalisasi nomor HP Indonesia ke format +62. */
export function normalizePhone(input: string): string {
  let p = (input || "").replace(/[^0-9+]/g, "");
  if (p.startsWith("0")) p = "+62" + p.slice(1);
  else if (p.startsWith("62")) p = "+" + p;
  else if (!p.startsWith("+")) p = "+62" + p;
  return p;
}

/** Tampilan ramah: +6281… → 0812… */
export function displayPhone(p: string): string {
  return p.startsWith("+62") ? "0" + p.slice(3) : p;
}
