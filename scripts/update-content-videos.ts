import "dotenv/config";
import { prisma } from "../lib/db";

// Tempel video YouTube nyata (terverifikasi embeddable) ke materi Belajar yang ada.
// Sebelumnya videoUrl berisi placeholder palsu (?v=organik, dll) yang tidak bisa diputar.
// Jalankan: npx tsx scripts/update-content-videos.ts   (idempoten — aman diulang)

const MAP: Record<string, string | null> = {
  // prisma/seed.ts
  "memilah-sampah-organik-dengan-benar": "https://www.youtube.com/watch?v=YRFdja0AAVE",
  "mengenal-3-jenis-sampah-dan-contohnya": "https://www.youtube.com/watch?v=x2xhAQIodN0",
  "daur-ulang-sampah-organik-di-rumah": "https://www.youtube.com/watch?v=_hAv9wrPAvc",
  "mengurangi-plastik-sekali-pakai": "https://www.youtube.com/watch?v=b9C3zUbeCKA",
  "kebiasaan-lestari-mulai-dari-rumah": "https://www.youtube.com/watch?v=xjC7FhLk3Ng",
  "kelola-limbah-b3-dan-e-waste": "https://www.youtube.com/watch?v=6R_WLAuTNx0",
  "membuat-kompos-ember-tumpuk": "https://www.youtube.com/watch?v=FaONF60w_Vg",
  // scripts/seed-demo-warga.ts
  "pilah-organik-benar": "https://www.youtube.com/watch?v=YRFdja0AAVE",
  "anorganik-bernilai": "https://www.youtube.com/watch?v=b9C3zUbeCKA",
  "kenali-limbah-b3": "https://www.youtube.com/watch?v=6R_WLAuTNx0",
  "budidaya-maggot-bsf": "https://www.youtube.com/watch?v=_hAv9wrPAvc",
};

async function main() {
  let updated = 0;
  for (const [slug, videoUrl] of Object.entries(MAP)) {
    const res = await prisma.educationContent.updateMany({ where: { slug }, data: { videoUrl } });
    if (res.count) updated += res.count;
    console.log(`${res.count ? "✓" : "–"} ${slug}`);
  }
  console.log(`\nSelesai. ${updated} materi diperbarui.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
