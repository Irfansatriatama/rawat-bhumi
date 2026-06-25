// Seed awal pilot (cara resmi Prisma: prisma/seed.ts).
// Jalankan: npm run db:seed  (butuh tabel sudah dibuat via `prisma migrate dev`)
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ALL_PERMISSIONS } from "../lib/permissions";
import { PARTNER_TYPE } from "../lib/prisma-enums";

// Prisma 7: butuh driver adapter. Seed dijalankan via CLI → pakai DIRECT_URL.
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1) Permission definitions (PBAC)
  for (const p of ALL_PERMISSIONS) {
    await prisma.permissionDef.upsert({
      where: { key: p.key },
      update: { description: p.description, group: p.group },
      create: { key: p.key, description: p.description, group: p.group },
    });
  }

  // 2) Wilayah pilot: RT 14 RW 01 Jagakarsa
  const kel = await prisma.kelurahan.create({
    data: { name: "Jagakarsa", kota: "Jakarta Selatan" },
  });
  const rw = await prisma.rW.create({ data: { number: "01", kelurahanId: kel.id } });
  const rt = await prisma.rT.create({ data: { number: "14", rwId: rw.id, totalKK: 300 } });
  console.log("Wilayah pilot dibuat:", { kelurahan: kel.name, rw: rw.number, rt: rt.number });

  // 3) Mitra hilir (4 jalur)
  await prisma.partner.createMany({
    data: [
      { name: "KTH Laskaru Cipedak", type: PARTNER_TYPE.ORGANIK_PROCESSOR, capacityKgPerDay: 2000, notes: "Offtaker organik proven (±2 ton/hari)" },
      { name: "Pabrik Daur Ulang (TBD)", type: PARTNER_TYPE.RECYCLER },
      { name: "Mitra Pirolisis Bersertifikat (TBD)", type: PARTNER_TYPE.PYROLYSIS },
      { name: "Pengelola B3 Berizin (TBD)", type: PARTNER_TYPE.B3_HANDLER },
    ],
  });

  // 4) Materi edukasi (Belajar) — idempotent via upsert by slug
  const now = Date.now();
  const day = 86400000;
  const materi = [
    {
      slug: "memilah-sampah-organik-dengan-benar",
      title: "Cara Memilah Sampah Organik dengan Benar",
      category: "ORGANIK",
      summary: "Panduan praktis memisahkan sisa makanan & bahan alami agar siap dikompos.",
      content:
        "Sampah organik adalah sisa makhluk hidup yang mudah terurai: sisa sayur, kulit buah, ampas kopi, daun kering.\n\n" +
        "1. Sediakan wadah khusus organik berlubang agar tidak bau.\n" +
        "2. Tiriskan sisa makanan, hindari mencampur minyak berlebih.\n" +
        "3. Pisahkan dari plastik, tisu basah, dan kemasan.\n" +
        "4. Setor saat pickup atau olah jadi kompos/pakan maggot.\n\n" +
        "Memilah organik sejak dari rumah membuat proses kompos lebih cepat dan bersih.",
      tags: ["organik", "pemilahan", "kompos"],
      viewCount: 4800,
      videoUrl: "https://www.youtube.com/watch?v=YRFdja0AAVE",
      daysAgo: 1,
    },
    {
      slug: "mengenal-3-jenis-sampah-dan-contohnya",
      title: "Mengenal 3 Jenis Sampah & Contohnya",
      category: "PILAH_SAMPAH",
      summary: "Organik, anorganik, dan residu — kenali bedanya lewat contoh sehari-hari.",
      content:
        "Mengenali jenis sampah adalah langkah pertama mengelolanya.\n\n" +
        "• Organik: sisa makanan, daun, kulit buah.\n" +
        "• Anorganik: plastik, kaca, logam, kertas — bisa didaur ulang.\n" +
        "• Residu: popok, pembalut, puntung rokok — sulit diolah.\n\n" +
        "Tambahan: B3 (baterai, lampu, elektronik) butuh penanganan khusus.",
      tags: ["dasar", "pemilahan"],
      viewCount: 6200,
      videoUrl: "https://www.youtube.com/watch?v=x2xhAQIodN0",
      daysAgo: 3,
    },
    {
      slug: "daur-ulang-sampah-organik-di-rumah",
      title: "Daur Ulang Sampah Organik di Rumah",
      category: "MAGGOT_BSF",
      summary: "Ubah sisa dapur jadi kompos & pakan maggot tanpa ribet dan tanpa bau.",
      content:
        "Daur ulang organik bisa dilakukan di rumah dengan dua cara populer:\n\n" +
        "1. Komposter ember tumpuk untuk menghasilkan pupuk.\n" +
        "2. Budidaya maggot BSF untuk mengurai sampah lebih cepat.\n\n" +
        "Keduanya mengurangi sampah ke TPA dan menghasilkan produk bernilai.",
      tags: ["organik", "maggot", "kompos"],
      viewCount: 5100,
      videoUrl: "https://www.youtube.com/watch?v=_hAv9wrPAvc",
      daysAgo: 5,
    },
    {
      slug: "mengurangi-plastik-sekali-pakai",
      title: "Mengurangi Plastik Sekali Pakai",
      category: "ANORGANIK",
      summary: "Langkah sederhana memangkas plastik sekali pakai dalam keseharian.",
      content:
        "Plastik sekali pakai menyumbang sampah anorganik terbesar.\n\n" +
        "• Bawa tas belanja & botol minum sendiri.\n" +
        "• Tolak sedotan dan kantong plastik bila tak perlu.\n" +
        "• Pilih produk dengan kemasan isi ulang.\n\n" +
        "Kebiasaan kecil ini berdampak besar pada pengurangan emisi.",
      tags: ["anorganik", "plastik", "reduce"],
      viewCount: 7300,
      videoUrl: "https://www.youtube.com/watch?v=b9C3zUbeCKA",
      daysAgo: 2,
    },
    {
      slug: "kebiasaan-lestari-mulai-dari-rumah",
      title: "Kebiasaan Lestari Mulai dari Rumah",
      category: "LINGKUNGAN",
      summary: "Rutinitas ramah lingkungan yang bisa kamu mulai hari ini.",
      content:
        "Gaya hidup lestari tidak harus rumit. Mulai dari memilah sampah, hemat energi, " +
        "dan mengurangi konsumsi berlebih. Konsistensi kecil setiap hari membentuk dampak besar.",
      tags: ["lingkungan", "kebiasaan"],
      viewCount: 3400,
      videoUrl: "https://www.youtube.com/watch?v=xjC7FhLk3Ng" as string | null,
      daysAgo: 7,
    },
    {
      slug: "kelola-limbah-b3-dan-e-waste",
      title: "Kelola Limbah B3 & E-Waste dengan Aman",
      category: "B3",
      summary: "Baterai, lampu, dan elektronik bekas perlu jalur khusus — ini caranya.",
      content:
        "Limbah B3 (Bahan Berbahaya & Beracun) tidak boleh dibuang sembarangan.\n\n" +
        "• Kumpulkan baterai, lampu, dan elektronik bekas terpisah.\n" +
        "• Jangan dibakar atau dipendam.\n" +
        "• Serahkan ke titik pengumpulan B3 / pickup khusus.\n\n" +
        "Penanganan benar mencegah pencemaran tanah dan air.",
      tags: ["b3", "e-waste"],
      viewCount: 2900,
      videoUrl: "https://www.youtube.com/watch?v=6R_WLAuTNx0",
      daysAgo: 9,
    },
    {
      slug: "memahami-sampah-residu",
      title: "Memahami Sampah Residu",
      category: "RESIDU",
      summary: "Apa itu residu dan kenapa jumlahnya harus ditekan seminimal mungkin.",
      content:
        "Residu adalah sampah yang tidak bisa didaur ulang maupun dikompos, " +
        "seperti popok dan pembalut. Tujuannya: tekan volume residu dengan memilah lebih teliti.",
      tags: ["residu", "dasar"],
      viewCount: 1800,
      videoUrl: null as string | null,
      daysAgo: 11,
    },
    {
      slug: "membuat-kompos-ember-tumpuk",
      title: "Membuat Kompos dengan Ember Tumpuk",
      category: "ORGANIK",
      summary: "Metode komposter sederhana untuk rumah dengan lahan terbatas.",
      content:
        "Komposter ember tumpuk cocok untuk rumah perkotaan.\n\n" +
        "1. Lubangi dasar ember atas untuk drainase.\n" +
        "2. Masukkan sisa organik + bahan kering (daun/serbuk gergaji).\n" +
        "3. Aduk berkala, panen kompos dalam 4-6 minggu.",
      tags: ["organik", "kompos", "diy"],
      viewCount: 4100,
      videoUrl: "https://www.youtube.com/watch?v=FaONF60w_Vg",
      daysAgo: 6,
    },
  ];

  for (const m of materi) {
    const { daysAgo, ...rest } = m;
    const publishedAt = new Date(now - daysAgo * day);
    await prisma.educationContent.upsert({
      where: { slug: m.slug },
      update: { ...rest, isPublished: true, publishedAt },
      create: { ...rest, isPublished: true, publishedAt },
    });
  }
  console.log(`Materi edukasi di-seed: ${materi.length} item`);

  console.log("Seed selesai. Buat akun admin via signup Better Auth, lalu set role di UserProfile.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
