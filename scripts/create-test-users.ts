import "dotenv/config";
import { auth } from "../lib/auth";
import { prisma } from "../lib/db";
import { USER_ROLE } from "../lib/prisma-enums";

// Buat akun testing: 1 WARGA + 1 KSATRIA_BHUMI.
// Jalankan: npx tsx scripts/create-test-users.ts
// Override via env: WARGA_EMAIL / KSATRIA_EMAIL / TEST_PASSWORD

const PASSWORD = process.env.TEST_PASSWORD || "Test#2026";
const WARGA_EMAIL = process.env.WARGA_EMAIL || "warga@rawatbhumi.id";
const KSATRIA_EMAIL = process.env.KSATRIA_EMAIL || "ksatria@rawatbhumi.id";

async function ensureUser(email: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("ℹ User sudah ada:", email);
    return existing.id;
  }
  const res = await auth.api.signUpEmail({ body: { email, password: PASSWORD, name } });
  console.log("✔ User dibuat:", email);
  return res.user.id;
}

async function main() {
  // Wilayah pilot dari seed (RT 14 RW 01 Jagakarsa). Ambil RT pertama yang ada.
  const rt = await prisma.rT.findFirst({ orderBy: { createdAt: "asc" } });
  if (!rt) {
    console.warn("⚠ Belum ada RT. Jalankan `npm run db:seed` dulu. Lanjut tanpa rtId.");
  }
  const rtId = rt?.id ?? null;

  // ---------- WARGA ----------
  const wargaUserId = await ensureUser(WARGA_EMAIL, "Warga Test");
  await prisma.userProfile.upsert({
    where: { userId: wargaUserId },
    update: { role: USER_ROLE.WARGA, isActive: true, rtId },
    create: { userId: wargaUserId, role: USER_ROLE.WARGA, isActive: true, rtId },
  });
  console.log("✔ Profil WARGA siap →", WARGA_EMAIL);

  // ---------- KSATRIA ----------
  const ksatriaUserId = await ensureUser(KSATRIA_EMAIL, "Ksatria Test");
  const ksatriaProfile = await prisma.userProfile.upsert({
    where: { userId: ksatriaUserId },
    update: { role: USER_ROLE.KSATRIA_BHUMI, isActive: true, rtId },
    create: { userId: ksatriaUserId, role: USER_ROLE.KSATRIA_BHUMI, isActive: true, rtId },
  });
  // KsatriaProfile.userId mereferensikan UserProfile.id (bukan User.id).
  await prisma.ksatriaProfile.upsert({
    where: { userId: ksatriaProfile.id },
    update: {},
    create: {
      userId: ksatriaProfile.id,
      employeeId: "KSATRIA-001",
      vehicleType: "Motor roda tiga",
      vehiclePlate: "B 1234 RB",
    },
  });
  console.log("✔ Profil KSATRIA + KsatriaProfile siap →", KSATRIA_EMAIL);

  console.log("\n=== Akun testing ===");
  console.log("WARGA   :", WARGA_EMAIL, "/", PASSWORD, "→ /beranda");
  console.log("KSATRIA :", KSATRIA_EMAIL, "/", PASSWORD, "→ /ksatria/dashboard");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("‼ Gagal:", e);
  await prisma.$disconnect();
  process.exit(1);
});
