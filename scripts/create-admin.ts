import "dotenv/config";
import { auth } from "../lib/auth";
import { prisma } from "../lib/db";
import { USER_ROLE } from "../lib/prisma-enums";

// Override lewat env: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/create-admin.ts
const email = process.env.ADMIN_EMAIL || "admin@rawatbhumi.id";
const password = process.env.ADMIN_PASSWORD || "AdminRawat#2026";
const name = "Super Admin";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email } });
  let userId: string;

  if (existing) {
    userId = existing.id;
    console.log("ℹ User sudah ada:", email);
  } else {
    const res = await auth.api.signUpEmail({ body: { email, password, name } });
    userId = res.user.id;
    console.log("✔ User dibuat:", email);
  }

  await prisma.userProfile.upsert({
    where: { userId },
    update: { role: USER_ROLE.SUPER_ADMIN, isActive: true },
    create: { userId, role: USER_ROLE.SUPER_ADMIN, isActive: true },
  });

  console.log("✔ UserProfile role SUPER_ADMIN siap.");
  console.log("→ Login:", email, "/", password);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("�‼ Gagal:", e);
  await prisma.$disconnect();
  process.exit(1);
});
