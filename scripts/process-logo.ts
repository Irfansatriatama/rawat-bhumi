import sharp from "sharp";
import { existsSync } from "node:fs";
import path from "node:path";

// "Edit sedikit" logo Rawat Bhumi untuk dipakai di topbar:
// 1) trim ruang kosong di tepi (auto, toleran thd anti-alias),
// 2) rapikan tinggi ke 80px @2x (tajam di layar HP), jaga rasio,
// 3) simpan PNG transparan teroptimasi.
// Sumber:  public/logo-rawat-bhumi.png  (taruh file logo asli di sini)
// Output:  public/logo-rawat-bhumi.png  (ditimpa, sudah rapi)
//          public/logo-rawat-bhumi-mark.png (emblem saja, bila bisa di-crop)

const SRC = path.join(process.cwd(), "public", "logo-rawat-bhumi.png");

async function main() {
  if (!existsSync(SRC)) {
    console.error(`✗ File belum ada: ${SRC}\n  Simpan logo Rawat Bhumi ke path itu dulu, lalu jalankan ulang.`);
    process.exit(1);
  }

  const input = await sharp(SRC).ensureAlpha().toBuffer();
  const meta = await sharp(input).metadata();
  console.log(`Sumber: ${meta.width}×${meta.height} (${meta.format})`);

  // Trim tepi seragam (background putih/transparan) + resize tinggi ke 160px (tampil ~80px @2x)
  const trimmed = await sharp(input)
    .trim({ threshold: 12 })
    .resize({ height: 160, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();

  await sharp(trimmed).toFile(SRC + ".tmp");
  // ganti atomik
  const fs = await import("node:fs/promises");
  await fs.rename(SRC + ".tmp", SRC);

  const out = await sharp(SRC).metadata();
  console.log(`✓ Logo dirapikan → ${out.width}×${out.height}px (public/logo-rawat-bhumi.png)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
