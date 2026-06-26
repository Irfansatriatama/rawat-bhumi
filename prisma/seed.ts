// Seed lengkap (cara resmi Prisma: prisma/seed.ts).
// Jalankan: npm run db:seed  (butuh tabel sudah dibuat via `prisma migrate dev`)
//
// Seed ini IDEMPOTEN: data domain di-reset tiap run, tapi akun Better Auth
// (tabel user/account) dipertahankan agar login tetap jalan antar-run.
// User dibuat lewat auth.api.signUpEmail → password ter-hash benar & bisa login.
import "dotenv/config";
import { auth } from "../lib/auth";
import { prisma } from "../lib/db";
import { ALL_PERMISSIONS } from "../lib/permissions";
import {
  USER_ROLE,
  PARTNER_TYPE,
  SCHEDULE_STATUS,
  PICKUP_STATUS,
  POINT_TYPE,
  SUBSCRIPTION_PLAN,
  SUBSCRIPTION_STATUS,
  PAYMENT_STATUS,
  REDEMPTION_STATUS,
  CHALLENGE_TARGET,
  NOTIFICATION_TYPE,
  WASTE_CATEGORY,
  REVENUE_SOURCE,
  ENTRY_TYPE,
  DELIVERY_STATUS,
  CATEGORY_TO_PARTNER,
} from "../lib/prisma-enums";
import { calcTotalGrams, calcPointsEarned, calcCo2ReducedKg, calcKsatriaEarning } from "../lib/business-rules";

// ---------- util ----------
const now = new Date();
const DAY = 86400000;
const daysAgo = (n: number) => new Date(now.getTime() - n * DAY);
const periodOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const CUR_PERIOD = periodOf(now);
const PREV_PERIOD = periodOf(new Date(now.getFullYear(), now.getMonth() - 1, 1));

// PRNG deterministik (mulberry32) → seed reproducible tiap run.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260626);
const ri = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

const PASSWORD = process.env.SEED_PASSWORD || "RawatBhumi#2026";

async function ensureUser(email: string, name: string): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing.id;
  const res = await auth.api.signUpEmail({ body: { email, password: PASSWORD, name } });
  return res.user.id;
}

// ---------- reset domain (akun auth dipertahankan) ----------
async function resetDomain() {
  await prisma.revenueEntry.deleteMany();
  await prisma.wasteDelivery.deleteMany();
  await prisma.eSGReport.deleteMany();
  await prisma.ksatriaEarning.deleteMany();
  await prisma.wasteRecord.deleteMany();
  await prisma.pickupRequest.deleteMany();
  await prisma.pickupSchedule.deleteMany();
  await prisma.subscriptionPayment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.pointHistory.deleteMany();
  await prisma.challengeParticipation.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.communityStats.deleteMany();
  await prisma.communityEvent.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userPermissionOverride.deleteMany();
  await prisma.ksatriaProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.rT.deleteMany();
  await prisma.rW.deleteMany();
  await prisma.kelurahan.deleteMany();
}

async function main() {
  // ============================================================
  // 1) PERMISSION DEFINITIONS (PBAC)
  // ============================================================
  for (const p of ALL_PERMISSIONS) {
    await prisma.permissionDef.upsert({
      where: { key: p.key },
      update: { description: p.description, group: p.group },
      create: { key: p.key, description: p.description, group: p.group },
    });
  }

  await resetDomain();

  // ============================================================
  // 2) WILAYAH — Kelurahan Jagakarsa, RW 01, 3 RT
  // ============================================================
  const kel = await prisma.kelurahan.create({ data: { name: "Jagakarsa", kota: "Jakarta Selatan" } });
  const rw = await prisma.rW.create({ data: { number: "01", kelurahanId: kel.id } });
  const rt14 = await prisma.rT.create({ data: { number: "14", rwId: rw.id, totalKK: 150 } });
  const rt15 = await prisma.rT.create({ data: { number: "15", rwId: rw.id, totalKK: 90 } });
  const rt16 = await prisma.rT.create({ data: { number: "16", rwId: rw.id, totalKK: 60 } });
  const RTS = [rt14, rt15, rt16];
  console.log(`Wilayah: Kel. ${kel.name} / RW ${rw.number} / ${RTS.length} RT`);

  // ============================================================
  // 3) MITRA HILIR (4 jalur)
  // ============================================================
  await prisma.partner.createMany({
    data: [
      { name: "KTH Laskaru Cipedak", type: PARTNER_TYPE.ORGANIK_PROCESSOR, contactName: "Pak Darto", phone: "0812-1111-2222", address: "Cipedak, Jagakarsa", capacityKgPerDay: 2000, notes: "Offtaker organik proven (±2 ton/hari)" },
      { name: "CV Daur Plastik Nusantara", type: PARTNER_TYPE.RECYCLER, contactName: "Bu Sari", phone: "0813-3333-4444", address: "Ciganjur, Jagakarsa", capacityKgPerDay: 800 },
      { name: "Mitra Pirolisis Bersertifikat", type: PARTNER_TYPE.PYROLYSIS, contactName: "Pak Indra", phone: "0815-5555-6666", capacityKgPerDay: 300 },
      { name: "Pengelola B3 Berizin (PT Wastec)", type: PARTNER_TYPE.B3_HANDLER, contactName: "Pak Yusuf", phone: "0817-7777-8888", capacityKgPerDay: 100 },
    ],
  });
  const partners = await prisma.partner.findMany();
  const partnerByType = new Map(partners.map((p) => [p.type, p]));

  // ============================================================
  // 4) AKUN — Admin, Ksatria, Warga (login lewat Better Auth)
  // ============================================================
  // ---- Super Admin ----
  const superAdminUserId = await ensureUser("admin@rawatbhumi.id", "Super Admin");
  await prisma.userProfile.create({
    data: { userId: superAdminUserId, role: USER_ROLE.SUPER_ADMIN, isActive: true, phone: "0811-0000-0001" },
  });

  // ---- Admin RT ----
  const adminRtUserId = await ensureUser("adminrt@rawatbhumi.id", "Slamet Riyadi");
  await prisma.userProfile.create({
    data: { userId: adminRtUserId, role: USER_ROLE.ADMIN_RT, rtId: rt14.id, isActive: true, phone: "0811-0000-0002" },
  });

  // ---- Ksatria Bhumi (2 orang) ----
  type KsatriaSeed = { email: string; name: string; employeeId: string; vehiclePlate: string; onDuty: boolean };
  const ksatriaSeeds: KsatriaSeed[] = [
    { email: "ksatria@rawatbhumi.id", name: "Asep Nugraha", employeeId: "KSATRIA-001", vehiclePlate: "B 1234 RB", onDuty: true },
    { email: "ksatria2@rawatbhumi.id", name: "Budi Santoso", employeeId: "KSATRIA-002", vehiclePlate: "B 5678 RB", onDuty: false },
  ];
  const ksatriaProfiles: { id: string; name: string; email: string }[] = [];
  for (const k of ksatriaSeeds) {
    const uid = await ensureUser(k.email, k.name);
    const profile = await prisma.userProfile.create({
      data: { userId: uid, role: USER_ROLE.KSATRIA_BHUMI, rtId: rt14.id, isActive: true, phone: "0812-9000-" + k.employeeId.slice(-4) },
    });
    const ks = await prisma.ksatriaProfile.create({
      data: {
        userId: profile.id,
        employeeId: k.employeeId,
        vehicleType: "Motor roda tiga",
        vehiclePlate: k.vehiclePlate,
        isOnDuty: k.onDuty,
        currentLat: k.onDuty ? -6.331 : null,
        currentLng: k.onDuty ? 106.81 : null,
        lastActiveAt: k.onDuty ? daysAgo(0) : daysAgo(2),
      },
    });
    ksatriaProfiles.push({ id: ks.id, name: k.name, email: k.email });
  }

  // ---- Warga (Penjaga Bhumi) ----
  type WargaSeed = { email: string; name: string; rt: typeof rt14; plan: string; subStatus: string; premiumDemo?: boolean };
  const wargaSeeds: WargaSeed[] = [
    { email: "warga@rawatbhumi.id", name: "Siti Aminah", rt: rt14, plan: SUBSCRIPTION_PLAN.PREMIUM, subStatus: SUBSCRIPTION_STATUS.ACTIVE, premiumDemo: true },
    { email: "dewi@rawatbhumi.id", name: "Dewi Lestari", rt: rt14, plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA, subStatus: SUBSCRIPTION_STATUS.ACTIVE },
    { email: "joko@rawatbhumi.id", name: "Joko Susilo", rt: rt14, plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA, subStatus: SUBSCRIPTION_STATUS.ACTIVE },
    { email: "rina@rawatbhumi.id", name: "Rina Wati", rt: rt14, plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA, subStatus: SUBSCRIPTION_STATUS.OVERDUE },
    { email: "lia@rawatbhumi.id", name: "Lia Marlina", rt: rt14, plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA, subStatus: SUBSCRIPTION_STATUS.ACTIVE },
    { email: "agus@rawatbhumi.id", name: "Agus Salim", rt: rt15, plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA, subStatus: SUBSCRIPTION_STATUS.ACTIVE },
    { email: "maya@rawatbhumi.id", name: "Maya Sari", rt: rt15, plan: SUBSCRIPTION_PLAN.PREMIUM, subStatus: SUBSCRIPTION_STATUS.ACTIVE },
    { email: "bambang@rawatbhumi.id", name: "Bambang Hermawan", rt: rt15, plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA, subStatus: SUBSCRIPTION_STATUS.OVERDUE },
    { email: "eko@rawatbhumi.id", name: "Eko Prasetyo", rt: rt15, plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA, subStatus: SUBSCRIPTION_STATUS.ACTIVE },
    { email: "putri@rawatbhumi.id", name: "Putri Andini", rt: rt16, plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA, subStatus: SUBSCRIPTION_STATUS.ACTIVE },
    { email: "hendra@rawatbhumi.id", name: "Hendra Gunawan", rt: rt16, plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA, subStatus: SUBSCRIPTION_STATUS.ACTIVE },
    { email: "nur@rawatbhumi.id", name: "Nur Halimah", rt: rt16, plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA, subStatus: SUBSCRIPTION_STATUS.ACTIVE },
  ];

  type Warga = { profileId: string; userId: string; name: string; rt: typeof rt14; seed: WargaSeed };
  const warga: Warga[] = [];
  for (const w of wargaSeeds) {
    const uid = await ensureUser(w.email, w.name);
    const houseNo = ri(1, 88);
    const profile = await prisma.userProfile.create({
      data: {
        userId: uid,
        role: USER_ROLE.WARGA,
        rtId: w.rt.id,
        isActive: true,
        phone: "0856-" + ri(1000, 9999) + "-" + ri(1000, 9999),
        address: `Jl. Moh. Kahfi II No. ${houseNo}, RT ${w.rt.number} RW 01`,
      },
    });
    warga.push({ profileId: profile.id, userId: uid, name: w.name, rt: w.rt, seed: w });
  }
  console.log(`Akun: 1 super admin, 1 admin RT, ${ksatriaProfiles.length} ksatria, ${warga.length} warga`);

  // ============================================================
  // 5) SUBSCRIPTION + PEMBAYARAN (iuran)
  // ============================================================
  for (const w of warga) {
    const amount = w.seed.plan === SUBSCRIPTION_PLAN.PREMIUM ? 75000 : 50000;
    const overdue = w.seed.subStatus === SUBSCRIPTION_STATUS.OVERDUE;
    const sub = await prisma.subscription.create({
      data: {
        userId: w.profileId,
        plan: w.seed.plan,
        status: w.seed.subStatus,
        startDate: daysAgo(150),
        nextBillDate: overdue ? daysAgo(5) : daysAgo(-25),
      },
    });
    // 3 bulan tagihan: bulan lama PAID, bulan berjalan tergantung status.
    const months = [
      { period: periodOf(new Date(now.getFullYear(), now.getMonth() - 2, 1)), ageDays: 65, paid: true },
      { period: PREV_PERIOD, ageDays: 35, paid: true },
      { period: CUR_PERIOD, ageDays: 4, paid: !overdue },
    ];
    for (const m of months) {
      const paid = m.paid;
      await prisma.subscriptionPayment.create({
        data: {
          subscriptionId: sub.id,
          amount,
          method: pick(["QRIS", "TUNAI"]),
          externalId: "INV-" + m.period.replace("-", "") + "-" + w.profileId.slice(-5),
          status: paid ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
          paidAt: paid ? daysAgo(m.ageDays) : null,
          createdAt: daysAgo(m.ageDays + 3),
        },
      });
    }
  }

  // ============================================================
  // 6) PICKUP + WASTE RECORD (inti data dashboard & dampak)
  // ============================================================
  const pointsByProfile = new Map<string, number>();
  const addPoints = (pid: string, pts: number) => pointsByProfile.set(pid, (pointsByProfile.get(pid) ?? 0) + pts);

  // akumulator untuk CommunityStats & ESG
  const rtPeriod = new Map<string, { weight: number; co2: number; kk: Set<string> }>();
  const esgPeriod = new Map<string, { organik: number; anorganik: number; residu: number; b3: number; co2: number; kk: Set<string> }>();
  const bump = (
    map: Map<string, { weight: number; co2: number; kk: Set<string> }>,
    key: string,
    weightKg: number,
    co2: number,
    pid: string,
  ) => {
    const cur = map.get(key) ?? { weight: 0, co2: 0, kk: new Set<string>() };
    cur.weight += weightKg;
    cur.co2 += co2;
    cur.kk.add(pid);
    map.set(key, cur);
  };

  const TIME_SLOTS = ["08.00–10.00", "10.00–12.00", "15.00–17.00"];
  // offset hari (positif = lampau); jadwal selesai mingguan + 1 jadwal akan datang.
  const COMPLETED_OFFSETS = [1, 4, 8, 11, 18, 25];
  let recordCount = 0;
  let scheduleCount = 0;
  let openCount = 0;

  for (let r = 0; r < RTS.length; r++) {
    const rt = RTS[r];
    const rtWarga = warga.filter((w) => w.rt.id === rt.id);

    // ----- jadwal SELESAI + timbangan -----
    for (let i = 0; i < COMPLETED_OFFSETS.length; i++) {
      const offset = COMPLETED_OFFSETS[i];
      const date = daysAgo(offset);
      const ksatria = ksatriaProfiles[(r + i) % ksatriaProfiles.length];
      const schedule = await prisma.pickupSchedule.create({
        data: {
          rtId: rt.id,
          ksatriaId: ksatria.id,
          scheduledDate: date,
          timeSlot: pick(TIME_SLOTS),
          status: SCHEDULE_STATUS.COMPLETED,
          notes: "Penjemputan rutin mingguan.",
          createdAt: daysAgo(offset + 3),
        },
      });
      scheduleCount++;

      for (const w of rtWarga) {
        // sebagian kecil warga absen tiap siklus → data terlihat natural
        if (rand() < 0.18) continue;
        const req = await prisma.pickupRequest.create({
          data: {
            userId: w.profileId,
            scheduleId: schedule.id,
            status: PICKUP_STATUS.COMPLETED,
            address: `Jl. Moh. Kahfi II, RT ${rt.number} RW 01`,
            notes: rand() < 0.3 ? "Sudah dipilah dari rumah." : null,
            confirmedAt: date,
            createdAt: daysAgo(offset + 1),
          },
        });

        const g = {
          organikGrams: ri(1200, 4200),
          anorganikGrams: ri(400, 2200),
          residuGrams: ri(150, 900),
          b3Grams: rand() < 0.25 ? ri(50, 400) : 0,
        };
        const totalGrams = calcTotalGrams(g);
        const co2 = calcCo2ReducedKg(g);
        const points = calcPointsEarned(g);

        await prisma.wasteRecord.create({
          data: {
            pickupRequestId: req.id,
            userId: w.profileId,
            ksatriaId: ksatria.id,
            ...g,
            totalGrams,
            co2ReducedKg: co2,
            pointsEarned: points,
            recordedAt: date,
            createdAt: date,
          },
        });
        recordCount++;

        // ---- poin warga (PICKUP_COMPLETED + WEIGHT_BONUS) ----
        await prisma.pointHistory.create({
          data: { userId: w.profileId, points: 10, type: POINT_TYPE.PICKUP_COMPLETED, description: "Pickup selesai", refId: req.id, createdAt: date },
        });
        const bonus = points - 10;
        if (bonus > 0) {
          await prisma.pointHistory.create({
            data: { userId: w.profileId, points: bonus, type: POINT_TYPE.WEIGHT_BONUS, description: `Bonus ${g.organikGrams} g organik`, refId: req.id, createdAt: date },
          });
        }
        addPoints(w.profileId, points);

        // ---- akumulasi statistik ----
        const period = periodOf(date);
        bump(rtPeriod, `${rt.id}|${period}`, totalGrams / 1000, co2, w.profileId);
        const e = esgPeriod.get(period) ?? { organik: 0, anorganik: 0, residu: 0, b3: 0, co2: 0, kk: new Set<string>() };
        e.organik += g.organikGrams / 1000;
        e.anorganik += g.anorganikGrams / 1000;
        e.residu += g.residuGrams / 1000;
        e.b3 += g.b3Grams / 1000;
        e.co2 += co2;
        e.kk.add(w.profileId);
        esgPeriod.set(period, e);
      }
    }

    // ----- jadwal AKAN DATANG + request terbuka (feed dashboard ksatria) -----
    const ksatria = ksatriaProfiles[r % ksatriaProfiles.length];
    const upcoming = await prisma.pickupSchedule.create({
      data: {
        rtId: rt.id,
        ksatriaId: ksatria.id,
        scheduledDate: daysAgo(-(r + 2)), // beberapa hari ke depan
        timeSlot: pick(TIME_SLOTS),
        status: SCHEDULE_STATUS.SCHEDULED,
        notes: "Siapkan sampah terpilah sebelum jam penjemputan.",
      },
    });
    scheduleCount++;
    for (const w of rtWarga.slice(0, 3)) {
      await prisma.pickupRequest.create({
        data: {
          userId: w.profileId,
          scheduleId: upcoming.id,
          status: pick([PICKUP_STATUS.PENDING, PICKUP_STATUS.CONFIRMED]),
          address: `Jl. Moh. Kahfi II, RT ${rt.number} RW 01`,
          confirmedAt: null,
        },
      });
      openCount++;
    }
  }
  console.log(`Pickup: ${scheduleCount} jadwal, ${recordCount} timbangan, ${openCount} request terbuka`);

  // ============================================================
  // 7) REWARDS + REDEMPTION
  // ============================================================
  const rewardsSeed = [
    { name: "Tumbler Stainless Rawat Bhumi", description: "Botol minum 500ml ramah lingkungan.", pointsCost: 250, stock: 40, category: "Merchandise" },
    { name: "Tote Bag Kanvas", description: "Tas belanja kanvas pengganti kantong plastik.", pointsCost: 180, stock: 60, category: "Merchandise" },
    { name: "Voucher Pulsa Rp25.000", description: "Tukar poin jadi pulsa semua operator.", pointsCost: 300, stock: 100, category: "Voucher" },
    { name: "Bibit Tanaman Buah", description: "Bibit siap tanam untuk pekarangan.", pointsCost: 120, stock: 50, category: "Hijau" },
    { name: "Komposter Mini Ember Tumpuk", description: "Set komposter rumah tangga.", pointsCost: 500, stock: 15, category: "Hijau" },
  ];
  const rewards = [];
  for (const rwd of rewardsSeed) {
    rewards.push(await prisma.reward.create({ data: { ...rwd, isActive: true } }));
  }
  // redemption untuk warga demo (Siti) + beberapa warga lain
  const redeemers = warga.slice(0, 4);
  for (let i = 0; i < redeemers.length; i++) {
    const w = redeemers[i];
    const reward = rewards[i % rewards.length];
    const status = pick([REDEMPTION_STATUS.PENDING, REDEMPTION_STATUS.APPROVED, REDEMPTION_STATUS.FULFILLED]);
    await prisma.rewardRedemption.create({
      data: { userId: w.profileId, rewardId: reward.id, pointsUsed: reward.pointsCost, status, redeemedAt: daysAgo(ri(2, 20)) },
    });
    await prisma.pointHistory.create({
      data: { userId: w.profileId, points: -reward.pointsCost, type: POINT_TYPE.REDEEMED, description: `Tukar: ${reward.name}`, refId: reward.id, createdAt: daysAgo(ri(2, 20)) },
    });
    addPoints(w.profileId, -reward.pointsCost);
  }

  // ---- finalisasi totalPoints tiap warga ----
  for (const [pid, pts] of pointsByProfile) {
    await prisma.userProfile.update({ where: { id: pid }, data: { totalPoints: Math.max(0, pts) } });
  }

  // ============================================================
  // 8) CHALLENGES + PARTISIPASI
  // ============================================================
  const challenges = [
    { title: "Tantangan Pilah Organik", description: "Kumpulkan 50 kg sampah organik terpilah bulan ini.", targetType: CHALLENGE_TARGET.WEIGHT_KG, targetValue: 50, pointsReward: 200 },
    { title: "Rajin Setor 4x", description: "Ikut penjemputan 4 kali dalam sebulan.", targetType: CHALLENGE_TARGET.PICKUP_COUNT, targetValue: 4, pointsReward: 100 },
    { title: "RT Bebas Plastik", description: "Capai 80% partisipasi KK di RT-mu.", targetType: CHALLENGE_TARGET.PARTICIPATION_PCT, targetValue: 80, pointsReward: 300 },
  ];
  const challengeRows = [];
  for (const c of challenges) {
    challengeRows.push(
      await prisma.challenge.create({
        data: { ...c, startDate: new Date(now.getFullYear(), now.getMonth(), 1), endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0), isActive: true },
      }),
    );
  }
  for (const w of warga.slice(0, 8)) {
    const c = challengeRows[ri(0, challengeRows.length - 1)];
    const progress = Math.round(rand() * c.targetValue * 100) / 100;
    const done = progress >= c.targetValue;
    await prisma.challengeParticipation.create({
      data: { userId: w.profileId, challengeId: c.id, progress, isCompleted: done, completedAt: done ? daysAgo(ri(1, 10)) : null },
    });
  }

  // ============================================================
  // 9) COMMUNITY STATS (per RT per periode) + ranking dalam RW
  // ============================================================
  for (const period of [PREV_PERIOD, CUR_PERIOD]) {
    const rows = RTS.map((rt) => {
      const s = rtPeriod.get(`${rt.id}|${period}`);
      return { rt, weight: s?.weight ?? 0, co2: s?.co2 ?? 0, kk: s?.kk.size ?? 0 };
    });
    const ranked = [...rows].sort((a, b) => b.weight - a.weight);
    for (const row of rows) {
      const rank = ranked.findIndex((x) => x.rt.id === row.rt.id) + 1;
      await prisma.communityStats.upsert({
        where: { rtId_period: { rtId: row.rt.id, period } },
        update: { activeKK: row.kk, totalWeightKg: Math.round(row.weight * 10) / 10, totalCo2Kg: Math.round(row.co2 * 10) / 10, rankInRW: rank },
        create: { rtId: row.rt.id, period, activeKK: row.kk, totalWeightKg: Math.round(row.weight * 10) / 10, totalCo2Kg: Math.round(row.co2 * 10) / 10, rankInRW: rank },
      });
    }
  }

  // ============================================================
  // 10) KSATRIA EARNINGS (per bulan)
  // ============================================================
  for (const ks of ksatriaProfiles) {
    for (const { period, ageDays, paid } of [
      { period: PREV_PERIOD, ageDays: 30, paid: true },
      { period: CUR_PERIOD, ageDays: 0, paid: false },
    ]) {
      const recs = await prisma.wasteRecord.findMany({ where: { ksatriaId: ks.id } });
      const sample = recs.filter(() => rand() < 0.5);
      const pickupCount = Math.max(8, sample.length || ri(8, 20));
      const totalWeight = sample.reduce((a, b) => a + b.totalGrams, 0) || ri(120000, 320000);
      const { baseAmount, bonusAmount, totalAmount } = calcKsatriaEarning(pickupCount, totalWeight);
      await prisma.ksatriaEarning.create({
        data: { ksatriaId: ks.id, period, pickupCount, totalWeight, baseAmount, bonusAmount, totalAmount, paidAt: paid ? daysAgo(ageDays) : null },
      });
    }
  }

  // ============================================================
  // 11) HILIR — WASTE DELIVERY + REVENUE/COST LEDGER
  // ============================================================
  const organikPartner = partnerByType.get(PARTNER_TYPE.ORGANIK_PROCESSOR)!;
  const recyclerPartner = partnerByType.get(PARTNER_TYPE.RECYCLER)!;
  const pyroPartner = partnerByType.get(PARTNER_TYPE.PYROLYSIS)!;
  const b3Partner = partnerByType.get(PARTNER_TYPE.B3_HANDLER)!;

  const deliverySpecs = [
    { partner: organikPartner, category: WASTE_CATEGORY.ORGANIK, offsets: [3, 10, 17, 24] },
    { partner: recyclerPartner, category: WASTE_CATEGORY.ANORGANIK, offsets: [5, 12, 19] },
    { partner: pyroPartner, category: WASTE_CATEGORY.RESIDU, offsets: [9, 23] },
    { partner: b3Partner, category: WASTE_CATEGORY.B3, offsets: [14] },
  ];
  const deliveries: { id: string; category: string; weightKg: number; period: string }[] = [];
  for (const spec of deliverySpecs) {
    // jaga konsistensi routing kategori → tipe partner
    if (CATEGORY_TO_PARTNER[spec.category] !== spec.partner.type) continue;
    for (const offset of spec.offsets) {
      const date = daysAgo(offset);
      const weightKg = Math.round((spec.category === WASTE_CATEGORY.ORGANIK ? ri(150, 420) : ri(60, 220)) * 10) / 10;
      const d = await prisma.wasteDelivery.create({
        data: {
          partnerId: spec.partner.id,
          deliveryDate: date,
          weightKg,
          category: spec.category,
          status: pick([DELIVERY_STATUS.DELIVERED, DELIVERY_STATUS.RECEIVED]),
          notes: `Penyaluran ${spec.category.toLowerCase()} ke ${spec.partner.name}.`,
          createdAt: date,
        },
      });
      deliveries.push({ id: d.id, category: spec.category, weightKg, period: periodOf(date) });
    }
  }

  // Ledger: revenue dari hilir + iuran; cost dari pirolisis & B3.
  const revByPeriod = new Map<string, number>();
  const costByPeriod = new Map<string, number>();
  const addLedger = (map: Map<string, number>, p: string, amt: number) => map.set(p, (map.get(p) ?? 0) + amt);

  for (const d of deliveries) {
    if (d.category === WASTE_CATEGORY.ORGANIK) {
      // organik → maggot + pupuk
      const maggot = Math.round(d.weightKg * 0.15) * 12000;
      const pupuk = Math.round(d.weightKg * 0.4) * 1500;
      await prisma.revenueEntry.create({ data: { source: REVENUE_SOURCE.MAGGOT, type: ENTRY_TYPE.REVENUE, deliveryId: d.id, period: d.period, weightKg: d.weightKg, unitPrice: 12000, amount: maggot, note: "Penjualan maggot BSF" } });
      await prisma.revenueEntry.create({ data: { source: REVENUE_SOURCE.PUPUK, type: ENTRY_TYPE.REVENUE, deliveryId: d.id, period: d.period, weightKg: d.weightKg, unitPrice: 1500, amount: pupuk, note: "Penjualan pupuk kompos" } });
      addLedger(revByPeriod, d.period, maggot + pupuk);
    } else if (d.category === WASTE_CATEGORY.ANORGANIK) {
      const cacah = Math.round(d.weightKg) * 3500;
      await prisma.revenueEntry.create({ data: { source: REVENUE_SOURCE.CACAHAN_PLASTIK, type: ENTRY_TYPE.REVENUE, deliveryId: d.id, period: d.period, weightKg: d.weightKg, unitPrice: 3500, amount: cacah, note: "Penjualan cacahan plastik" } });
      addLedger(revByPeriod, d.period, cacah);
    } else if (d.category === WASTE_CATEGORY.RESIDU) {
      const cost = Math.round(d.weightKg) * 2000;
      await prisma.revenueEntry.create({ data: { source: REVENUE_SOURCE.COST_PIROLISIS, type: ENTRY_TYPE.COST, deliveryId: d.id, period: d.period, weightKg: d.weightKg, unitPrice: 2000, amount: cost, note: "Biaya pirolisis residu" } });
      addLedger(costByPeriod, d.period, cost);
    } else if (d.category === WASTE_CATEGORY.B3) {
      const cost = Math.round(d.weightKg) * 8000;
      await prisma.revenueEntry.create({ data: { source: REVENUE_SOURCE.COST_B3, type: ENTRY_TYPE.COST, deliveryId: d.id, period: d.period, weightKg: d.weightKg, unitPrice: 8000, amount: cost, note: "Biaya pengelola B3 berizin" } });
      addLedger(costByPeriod, d.period, cost);
    }
  }
  // Iuran masuk sebagai revenue (rekap per periode)
  for (const period of [PREV_PERIOD, CUR_PERIOD]) {
    const iuran = warga.length * 50000;
    await prisma.revenueEntry.create({ data: { source: REVENUE_SOURCE.IURAN, type: ENTRY_TYPE.REVENUE, period, amount: iuran, note: "Rekap iuran warga" } });
    addLedger(revByPeriod, period, iuran);
  }

  // ============================================================
  // 12) ESG REPORT (per periode)
  // ============================================================
  for (const period of [PREV_PERIOD, CUR_PERIOD]) {
    const e = esgPeriod.get(period);
    if (!e) continue;
    const total = e.organik + e.anorganik + e.residu + e.b3;
    await prisma.eSGReport.create({
      data: {
        period,
        totalWeightKg: Math.round(total * 10) / 10,
        organikKg: Math.round(e.organik * 10) / 10,
        anorganikKg: Math.round(e.anorganik * 10) / 10,
        residuKg: Math.round(e.residu * 10) / 10,
        b3Kg: Math.round(e.b3 * 10) / 10,
        co2ReducedKg: Math.round(e.co2 * 10) / 10,
        activeKK: e.kk.size,
        ksatriaCount: ksatriaProfiles.length,
        revenueTotal: revByPeriod.get(period) ?? 0,
        costTotal: costByPeriod.get(period) ?? 0,
        narrative:
          `Pada periode ${period}, program pilot RT 14–16 RW 01 Jagakarsa mengelola ` +
          `${(Math.round(total * 10) / 10).toFixed(1)} kg sampah dari ${e.kk.size} KK aktif, ` +
          `mencegah ${(Math.round(e.co2 * 10) / 10).toFixed(1)} kg CO₂e. Jalur organik (maggot & pupuk) ` +
          `menjadi kontributor pendapatan utama, sementara residu & B3 disalurkan ke mitra berizin.`,
        generatedBy: "Super Admin",
        generatedAt: period === CUR_PERIOD ? daysAgo(1) : daysAgo(32),
      },
    });
  }

  // ============================================================
  // 13) EVENT KOMUNITAS + PENGUMUMAN
  // ============================================================
  await prisma.communityEvent.createMany({
    data: [
      { title: "Gotong Royong Bersih Lingkungan", category: "Gotong Royong", date: daysAgo(-6), timeLabel: "07.00 WIB", location: "Balai RW 01 Jagakarsa", rwId: rw.id, isPublished: true, publishedAt: daysAgo(3) },
      { title: "Workshop Kompos Ember Tumpuk", category: "Edukasi", date: daysAgo(-12), timeLabel: "09.00 WIB", location: "Posyandu RT 14", rtId: rt14.id, rwId: rw.id, isPublished: true, publishedAt: daysAgo(2) },
      { title: "Peluncuran Bank Sampah Bhumi", category: "Bank Sampah", date: daysAgo(-20), timeLabel: "15.30 WIB", location: "Lapangan RW 01", rwId: rw.id, isPublished: true, publishedAt: daysAgo(1) },
    ],
  });

  await prisma.announcement.createMany({
    data: [
      { title: "Jadwal Penjemputan Pekan Ini", body: "Penjemputan sampah terpilah dilakukan sesuai jadwal RT masing-masing. Mohon siapkan sampah sebelum jam penjemputan.", targetRole: null, isPublished: true, publishedAt: daysAgo(2) },
      { title: "Pengingat Iuran Bulanan", body: "Iuran Rp50.000/KK/bulan dapat dibayar via QRIS pada aplikasi atau tunai ke pengurus RT. Terima kasih atas partisipasinya.", targetRole: USER_ROLE.WARGA, isPublished: true, publishedAt: daysAgo(4) },
      { title: "Apresiasi Ksatria Bhumi", body: "Terima kasih kepada para Ksatria Bhumi atas dedikasinya. Penghasilan bulan lalu telah ditransfer.", targetRole: USER_ROLE.KSATRIA_BHUMI, isPublished: true, publishedAt: daysAgo(30) },
    ],
  });

  // ============================================================
  // 14) NOTIFIKASI (untuk warga demo + beberapa lainnya)
  // ============================================================
  for (const w of warga.slice(0, 6)) {
    const notifs = [
      { title: "Penjemputan terjadwal", body: "Sampahmu akan dijemput beberapa hari lagi. Siapkan dari sekarang ya!", type: NOTIFICATION_TYPE.PICKUP_REMINDER, isRead: false, age: 1 },
      { title: "Poin bertambah 🎉", body: "Kamu mendapat poin dari penjemputan terakhir.", type: NOTIFICATION_TYPE.POINTS_EARNED, isRead: false, age: 2 },
      { title: "Pengumuman baru", body: "Jadwal penjemputan pekan ini telah diperbarui.", type: NOTIFICATION_TYPE.ANNOUNCEMENT, isRead: true, age: 4 },
    ];
    for (const n of notifs) {
      await prisma.notification.create({
        data: { userId: w.userId, title: n.title, body: n.body, type: n.type, isRead: n.isRead, sentAt: daysAgo(n.age), createdAt: daysAgo(n.age) },
      });
    }
  }

  // ============================================================
  // 15) PBAC OVERRIDE (contoh): admin RT diberi akses lihat revenue hilir
  // ============================================================
  const adminRtProfile = await prisma.userProfile.findUnique({ where: { userId: adminRtUserId } });
  if (adminRtProfile) {
    await prisma.userPermissionOverride.create({
      data: { userId: adminRtProfile.id, permissionKey: "hilir.revenue.view", effect: "GRANT" },
    });
  }

  // ============================================================
  // 16) MATERI EDUKASI (Belajar) — idempotent via upsert by slug
  // ============================================================
  const day = DAY;
  const nowMs = now.getTime();
  const materi = [
    { slug: "memilah-sampah-organik-dengan-benar", title: "Cara Memilah Sampah Organik dengan Benar", category: "ORGANIK", summary: "Panduan praktis memisahkan sisa makanan & bahan alami agar siap dikompos.", content: "Sampah organik adalah sisa makhluk hidup yang mudah terurai: sisa sayur, kulit buah, ampas kopi, daun kering.\n\n1. Sediakan wadah khusus organik berlubang agar tidak bau.\n2. Tiriskan sisa makanan, hindari mencampur minyak berlebih.\n3. Pisahkan dari plastik, tisu basah, dan kemasan.\n4. Setor saat pickup atau olah jadi kompos/pakan maggot.\n\nMemilah organik sejak dari rumah membuat proses kompos lebih cepat dan bersih.", tags: ["organik", "pemilahan", "kompos"], viewCount: 4800, videoUrl: "https://www.youtube.com/watch?v=YRFdja0AAVE", daysAgo: 1 },
    { slug: "mengenal-3-jenis-sampah-dan-contohnya", title: "Mengenal 3 Jenis Sampah & Contohnya", category: "PILAH_SAMPAH", summary: "Organik, anorganik, dan residu — kenali bedanya lewat contoh sehari-hari.", content: "Mengenali jenis sampah adalah langkah pertama mengelolanya.\n\n• Organik: sisa makanan, daun, kulit buah.\n• Anorganik: plastik, kaca, logam, kertas — bisa didaur ulang.\n• Residu: popok, pembalut, puntung rokok — sulit diolah.\n\nTambahan: B3 (baterai, lampu, elektronik) butuh penanganan khusus.", tags: ["dasar", "pemilahan"], viewCount: 6200, videoUrl: "https://www.youtube.com/watch?v=x2xhAQIodN0", daysAgo: 3 },
    { slug: "daur-ulang-sampah-organik-di-rumah", title: "Daur Ulang Sampah Organik di Rumah", category: "MAGGOT_BSF", summary: "Ubah sisa dapur jadi kompos & pakan maggot tanpa ribet dan tanpa bau.", content: "Daur ulang organik bisa dilakukan di rumah dengan dua cara populer:\n\n1. Komposter ember tumpuk untuk menghasilkan pupuk.\n2. Budidaya maggot BSF untuk mengurai sampah lebih cepat.\n\nKeduanya mengurangi sampah ke TPA dan menghasilkan produk bernilai.", tags: ["organik", "maggot", "kompos"], viewCount: 5100, videoUrl: "https://www.youtube.com/watch?v=_hAv9wrPAvc", daysAgo: 5 },
    { slug: "mengurangi-plastik-sekali-pakai", title: "Mengurangi Plastik Sekali Pakai", category: "ANORGANIK", summary: "Langkah sederhana memangkas plastik sekali pakai dalam keseharian.", content: "Plastik sekali pakai menyumbang sampah anorganik terbesar.\n\n• Bawa tas belanja & botol minum sendiri.\n• Tolak sedotan dan kantong plastik bila tak perlu.\n• Pilih produk dengan kemasan isi ulang.\n\nKebiasaan kecil ini berdampak besar pada pengurangan emisi.", tags: ["anorganik", "plastik", "reduce"], viewCount: 7300, videoUrl: "https://www.youtube.com/watch?v=b9C3zUbeCKA", daysAgo: 2 },
    { slug: "kebiasaan-lestari-mulai-dari-rumah", title: "Kebiasaan Lestari Mulai dari Rumah", category: "LINGKUNGAN", summary: "Rutinitas ramah lingkungan yang bisa kamu mulai hari ini.", content: "Gaya hidup lestari tidak harus rumit. Mulai dari memilah sampah, hemat energi, dan mengurangi konsumsi berlebih. Konsistensi kecil setiap hari membentuk dampak besar.", tags: ["lingkungan", "kebiasaan"], viewCount: 3400, videoUrl: "https://www.youtube.com/watch?v=xjC7FhLk3Ng" as string | null, daysAgo: 7 },
    { slug: "kelola-limbah-b3-dan-e-waste", title: "Kelola Limbah B3 & E-Waste dengan Aman", category: "B3", summary: "Baterai, lampu, dan elektronik bekas perlu jalur khusus — ini caranya.", content: "Limbah B3 (Bahan Berbahaya & Beracun) tidak boleh dibuang sembarangan.\n\n• Kumpulkan baterai, lampu, dan elektronik bekas terpisah.\n• Jangan dibakar atau dipendam.\n• Serahkan ke titik pengumpulan B3 / pickup khusus.\n\nPenanganan benar mencegah pencemaran tanah dan air.", tags: ["b3", "e-waste"], viewCount: 2900, videoUrl: "https://www.youtube.com/watch?v=6R_WLAuTNx0", daysAgo: 9 },
    { slug: "memahami-sampah-residu", title: "Memahami Sampah Residu", category: "RESIDU", summary: "Apa itu residu dan kenapa jumlahnya harus ditekan seminimal mungkin.", content: "Residu adalah sampah yang tidak bisa didaur ulang maupun dikompos, seperti popok dan pembalut. Tujuannya: tekan volume residu dengan memilah lebih teliti.", tags: ["residu", "dasar"], viewCount: 1800, videoUrl: null as string | null, daysAgo: 11 },
    { slug: "membuat-kompos-ember-tumpuk", title: "Membuat Kompos dengan Ember Tumpuk", category: "ORGANIK", summary: "Metode komposter sederhana untuk rumah dengan lahan terbatas.", content: "Komposter ember tumpuk cocok untuk rumah perkotaan.\n\n1. Lubangi dasar ember atas untuk drainase.\n2. Masukkan sisa organik + bahan kering (daun/serbuk gergaji).\n3. Aduk berkala, panen kompos dalam 4-6 minggu.", tags: ["organik", "kompos", "diy"], viewCount: 4100, videoUrl: "https://www.youtube.com/watch?v=FaONF60w_Vg", daysAgo: 6 },
  ];
  for (const m of materi) {
    const { daysAgo: ago, ...rest } = m;
    const publishedAt = new Date(nowMs - ago * day);
    await prisma.educationContent.upsert({
      where: { slug: m.slug },
      update: { ...rest, isPublished: true, publishedAt },
      create: { ...rest, isPublished: true, publishedAt },
    });
  }
  console.log(`Materi edukasi: ${materi.length} item`);

  console.log("\n=== Seed selesai. Akun login (password: " + PASSWORD + ") ===");
  console.log("SUPER ADMIN : admin@rawatbhumi.id      → /admin/dashboard");
  console.log("ADMIN RT    : adminrt@rawatbhumi.id    → /admin/dashboard");
  console.log("KSATRIA     : ksatria@rawatbhumi.id    → /ksatria/dashboard");
  console.log("WARGA       : warga@rawatbhumi.id      → /beranda");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
