// Generator ikon PWA placeholder (pure Node, tanpa dependency).
// Ganti dengan logo Rawat Bhumi asli kapan saja — cukup timpa file PNG-nya.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Brand colors
const DARK = [15, 93, 77]; // #0F5D4D
const PRIMARY = [76, 224, 89]; // #4CE059
const WHITE = [255, 255, 255];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function encodePNG(size, pixels /* RGBA Uint8Array */) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter none
    pixels.subarray(y * stride, y * stride + stride).copy
      ? pixels.subarray(y * stride, y * stride + stride).copy(raw, y * (stride + 1) + 1)
      : Buffer.from(pixels.subarray(y * stride, y * stride + stride)).copy(raw, y * (stride + 1) + 1);
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// drawFn(x,y,size) -> [r,g,b,a]
function makeIcon(size, drawFn) {
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = drawFn(x, y, size);
      const i = (y * size + x) * 4;
      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      px[i + 3] = a;
    }
  }
  return encodePNG(size, px);
}

const dist = (x, y, s) => Math.hypot(x - s / 2, y - s / 2);

// Ikon utama: bg dark + ring primary (bentuk "O" sederhana)
function appIcon(x, y, s) {
  const d = dist(x, y, s);
  const ro = s * 0.3,
    ri = s * 0.17;
  if (d <= ro && d >= ri) return [...PRIMARY, 255];
  return [...DARK, 255];
}
// Badge: transparan + lingkaran putih (monokrom)
function badgeIcon(x, y, s) {
  return dist(x, y, s) <= s * 0.45 ? [...WHITE, 255] : [0, 0, 0, 0];
}

mkdirSync(join(root, "public/icons"), { recursive: true });
writeFileSync(join(root, "public/icons/icon-192.png"), makeIcon(192, appIcon));
writeFileSync(join(root, "public/icons/icon-512.png"), makeIcon(512, appIcon));
writeFileSync(join(root, "public/icons/icon-512-maskable.png"), makeIcon(512, appIcon));
writeFileSync(join(root, "public/badge.png"), makeIcon(96, badgeIcon));
console.log("Ikon placeholder dibuat: icon-192, icon-512, icon-512-maskable, badge.png");
