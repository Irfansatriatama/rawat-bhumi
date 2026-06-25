import "dotenv/config";
import { prisma } from "../lib/db";
import {
  SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS, SCHEDULE_STATUS, PICKUP_STATUS,
  CONTENT_CATEGORY, CHALLENGE_TARGET,
} from "../lib/prisma-enums";

// Isi data demo untuk akun warga agar Beranda tampil penuh (seperti mockup).
// Jalankan: npx tsx scripts/seed-demo-warga.ts   (idempoten — aman diulang)

const WARGA_EMAIL = process.env.WARGA_EMAIL || "warga@rawatbhumi.id";

async function main() {
  const wargaUser = await prisma.user.findUnique({ where: { email: WARGA_EMAIL } });
  if (!wargaUser) throw new Error(`User ${WARGA_EMAIL} belum ada. Jalankan create-test-users dulu.`);
  const warga = await prisma.userProfile.findUnique({ where: { userId: wargaUser.id } });
  if (!warga?.rtId) throw new Error("Warga belum punya rtId. Jalankan create-test-users dulu.");
  const ksatria = await prisma.ksatriaProfile.findFirst();

  // 1) Langganan aktif
  const now = new Date();
  await prisma.subscription.upsert({
    where: { userId: warga.id },
    update: { plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA, status: SUBSCRIPTION_STATUS.ACTIVE },
    create: {
      userId: warga.id,
      plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      startDate: new Date(now.getTime() - 30 * 864e5),
      nextBillDate: new Date(now.getTime() + 5 * 864e5),
    },
  });
  console.log("✔ Langganan aktif");

  // 2) Jadwal pickup mendatang (+2 hari) untuk RT, ditugaskan ke ksatria
  const upcoming = await prisma.pickupSchedule.findFirst({
    where: { rtId: warga.rtId, status: SCHEDULE_STATUS.SCHEDULED, scheduledDate: { gte: now } },
  });
  if (!upcoming) {
    await prisma.pickupSchedule.create({
      data: {
        rtId: warga.rtId,
        ksatriaId: ksatria?.id ?? null,
        scheduledDate: new Date(now.getTime() + 2 * 864e5),
        timeSlot: "08:00 - 10:00",
        status: SCHEDULE_STATUS.SCHEDULED,
        notes: "Pastikan sampah terpilah & sisa makanan besar siap pukul 20:00.",
      },
    });
    console.log("✔ Jadwal pickup mendatang dibuat");
  } else {
    console.log("ℹ Jadwal pickup mendatang sudah ada");
  }

  // 3) Setoran sampah selesai (mengisi Aktivitas, Stepper, Dampak, Kontribusi)
  const existingRecord = await prisma.wasteRecord.findFirst({ where: { userId: warga.id } });
  if (!existingRecord && ksatria) {
    const pastSchedule = await prisma.pickupSchedule.create({
      data: {
        rtId: warga.rtId,
        ksatriaId: ksatria.id,
        scheduledDate: new Date(now.getTime() - 4 * 864e5),
        timeSlot: "08:00 - 10:00",
        status: SCHEDULE_STATUS.COMPLETED,
      },
    });
    const req = await prisma.pickupRequest.create({
      data: {
        userId: warga.id,
        scheduleId: pastSchedule.id,
        status: PICKUP_STATUS.COMPLETED,
        address: "Jl. Kompas Melati No. 5",
        confirmedAt: new Date(now.getTime() - 4 * 864e5),
      },
    });
    await prisma.wasteRecord.create({
      data: {
        pickupRequestId: req.id,
        userId: warga.id,
        ksatriaId: ksatria.id,
        organikGrams: 27_000,
        anorganikGrams: 18_000,
        residuGrams: 4_000,
        b3Grams: 0,
        totalGrams: 49_000,
        co2ReducedKg: 35,
        pointsEarned: 120,
        recordedAt: new Date(now.getTime() - 4 * 864e5),
      },
    });
    // sinkronkan poin profil
    await prisma.userProfile.update({ where: { id: warga.id }, data: { totalPoints: { increment: 120 } } });
    console.log("✔ Setoran sampah + poin dibuat");
  } else {
    console.log("ℹ Setoran sampah sudah ada");
  }

  // 4) Materi belajar (carousel) — upsert by slug
  const materi = [
    { slug: "pilah-organik-benar", title: "Cara memilah sampah organik dengan benar", category: CONTENT_CATEGORY.ORGANIK, videoUrl: "https://example.com/v1" },
    { slug: "anorganik-bernilai", title: "Sampah anorganik yang masih bernilai jual", category: CONTENT_CATEGORY.ANORGANIK, videoUrl: null },
    { slug: "kenali-limbah-b3", title: "Kenali limbah B3 & e-waste di rumah", category: CONTENT_CATEGORY.B3, videoUrl: "https://example.com/v2" },
    { slug: "budidaya-maggot-bsf", title: "Budidaya maggot BSF dari sisa dapur", category: CONTENT_CATEGORY.MAGGOT_BSF, videoUrl: "https://example.com/v3" },
  ];
  for (const m of materi) {
    await prisma.educationContent.upsert({
      where: { slug: m.slug },
      update: { isPublished: true },
      create: {
        slug: m.slug,
        title: m.title,
        category: m.category,
        summary: "Panduan singkat 3 menit untuk warga.",
        content: "Konten lengkap menyusul.",
        videoUrl: m.videoUrl,
        isPublished: true,
        publishedAt: now,
      },
    });
  }
  console.log("✔ Materi belajar siap");

  // 5) Tantangan aktif
  const challengeCount = await prisma.challenge.count({ where: { isActive: true } });
  if (challengeCount === 0) {
    await prisma.challenge.createMany({
      data: [
        { title: "Setor 10 kg organik", description: "Kumpulkan 10 kg sampah organik bulan ini.", startDate: now, endDate: new Date(now.getTime() + 20 * 864e5), targetType: CHALLENGE_TARGET.WEIGHT_KG, targetValue: 10, pointsReward: 50, isActive: true },
        { title: "Hadir 4x penjemputan", description: "Konfirmasi kehadiran 4 kali penjemputan.", startDate: now, endDate: new Date(now.getTime() + 25 * 864e5), targetType: CHALLENGE_TARGET.PICKUP_COUNT, targetValue: 4, pointsReward: 75, isActive: true },
      ],
    });
    console.log("✔ Tantangan dibuat");
  } else {
    console.log("ℹ Tantangan sudah ada");
  }

  console.log("\nSelesai. Login warga & buka /beranda untuk lihat tampilan penuh.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("‼ Gagal:", e);
  await prisma.$disconnect();
  process.exit(1);
});
