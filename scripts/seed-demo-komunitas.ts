import "dotenv/config";
import { prisma } from "../lib/db";
import { SCHEDULE_STATUS, PICKUP_STATUS } from "../lib/prisma-enums";

// Data demo untuk halaman Komunitas (ranking antar-RT, peserta tantangan, event, pengumuman).
// Jalankan: npx tsx scripts/seed-demo-komunitas.ts   (idempoten)

async function main() {
  const warga = await prisma.userProfile.findFirst({ where: { rtId: { not: null }, isProvisional: false, role: "WARGA" } });
  const myRt = warga?.rtId ? await prisma.rT.findUnique({ where: { id: warga.rtId } }) : null;
  if (!myRt) throw new Error("RT warga belum ada. Jalankan create-test-users + seed-demo-warga dulu.");
  const ksatria = await prisma.ksatriaProfile.findFirst();

  // 1) RT tetangga (untuk ranking) + total bulan ini lewat 1 profil demo per RT
  async function rtWithTotal(number: string, totalKg: number) {
    let rt = await prisma.rT.findFirst({ where: { rwId: myRt!.rwId, number } });
    if (!rt) rt = await prisma.rT.create({ data: { rwId: myRt!.rwId, number, totalKK: 250 } });
    const uid = `demo-rt-${number}`;
    let prof = await prisma.userProfile.findUnique({ where: { userId: uid } });
    if (!prof) prof = await prisma.userProfile.create({ data: { userId: uid, role: "WARGA", rtId: rt.id, isActive: true, isProvisional: true } });
    const exists = await prisma.wasteRecord.findFirst({ where: { userId: prof.id } });
    if (!exists && ksatria) {
      const sch = await prisma.pickupSchedule.create({ data: { rtId: rt.id, ksatriaId: ksatria.id, scheduledDate: new Date(), timeSlot: "08:00 - 10:00", status: SCHEDULE_STATUS.COMPLETED } });
      const req = await prisma.pickupRequest.create({ data: { userId: prof.id, scheduleId: sch.id, status: PICKUP_STATUS.COMPLETED, address: "Demo" } });
      await prisma.wasteRecord.create({
        data: {
          pickupRequestId: req.id, userId: prof.id, ksatriaId: ksatria.id,
          organikGrams: totalKg * 600, anorganikGrams: totalKg * 300, residuGrams: totalKg * 100,
          totalGrams: totalKg * 1000, co2ReducedKg: totalKg * 0.7, recordedAt: new Date(),
        },
      });
    }
  }
  await rtWithTotal("12", 1250);
  await rtWithTotal("16", 620);
  console.log("✔ RT tetangga + total ranking siap");

  // 2) Peserta tantangan (agar progress & jumlah peserta terisi)
  const challenge = await prisma.challenge.findFirst({ where: { isActive: true }, orderBy: { endDate: "asc" } });
  if (challenge) {
    const partCount = await prisma.challengeParticipation.count({ where: { challengeId: challenge.id } });
    if (partCount < 6) {
      // warga asli
      await prisma.challengeParticipation.upsert({
        where: { userId_challengeId: { userId: warga!.id, challengeId: challenge.id } },
        update: { progress: challenge.targetValue * 0.7 },
        create: { userId: warga!.id, challengeId: challenge.id, progress: challenge.targetValue * 0.7 },
      });
      // peserta demo
      for (let i = 1; i <= 6; i++) {
        const uid = `demo-part-${i}`;
        let prof = await prisma.userProfile.findUnique({ where: { userId: uid } });
        if (!prof) prof = await prisma.userProfile.create({ data: { userId: uid, role: "WARGA", rtId: myRt.id, isActive: true, isProvisional: true } });
        await prisma.challengeParticipation.upsert({
          where: { userId_challengeId: { userId: prof.id, challengeId: challenge.id } },
          update: {},
          create: { userId: prof.id, challengeId: challenge.id, progress: challenge.targetValue * 0.7 },
        });
      }
      console.log("✔ Peserta tantangan dibuat");
    } else {
      console.log("ℹ Peserta tantangan sudah ada");
    }
  }

  // 3) Event & kegiatan
  const now = new Date();
  const events = [
    { title: "Kerja Bakti Lingkungan", category: "Gotong Royong", date: new Date(now.getTime() + 5 * 864e5), timeLabel: "07.00 WIB", location: `Taman RW ${myRt.number === "14" ? "01" : myRt.rwId}` },
    { title: "Pelatihan Bank Sampah", category: "Edukasi", date: new Date(now.getTime() + 9 * 864e5), timeLabel: "09.00 WIB", location: "Balai Warga" },
    { title: "Panen Maggot Bersama", category: "Komunitas", date: new Date(now.getTime() + 14 * 864e5), timeLabel: "08.00 WIB", location: "Rumah Kompos" },
  ];
  for (const e of events) {
    const exists = await prisma.communityEvent.findFirst({ where: { title: e.title } });
    if (!exists) await prisma.communityEvent.create({ data: { ...e, rwId: myRt.rwId, isPublished: true, publishedAt: now } });
  }
  console.log("✔ Event & kegiatan siap");

  // 4) Pengumuman
  const anns = [
    { title: "Pengumuman Pickup", body: "Jadwal pickup hari Jumat, 14 Juni 2025 · 08.00 - 10.00 WIB.", publishedAt: now },
    { title: "Info dari Pengurus RT", body: "Rapat warga akan diadakan pada 16 Juni 2025.", publishedAt: new Date(now.getTime() - 2 * 864e5) },
    { title: "Ayo Pilah Sampah!", body: "Yuk, pilah sampah dari rumah untuk lingkungan yang lebih bersih.", publishedAt: new Date(now.getTime() - 2 * 864e5) },
  ];
  for (const a of anns) {
    const exists = await prisma.announcement.findFirst({ where: { title: a.title } });
    if (!exists) await prisma.announcement.create({ data: { ...a, isPublished: true } });
  }
  console.log("✔ Pengumuman siap");

  console.log("\nSelesai. Buka /komunitas sebagai warga.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("‼ Gagal:", e);
  await prisma.$disconnect();
  process.exit(1);
});
