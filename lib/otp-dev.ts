// OTP dev/test mode — tanpa biaya SMS. Kode disimpan & bisa dilihat di layar
// onboarding. Set OTP_DEV_MODE="false" (atau pasang provider SMS asli) untuk produksi.
import { prisma } from "./db";
export { normalizePhone } from "./phone";

export const OTP_DEV_MODE = process.env.OTP_DEV_MODE !== "false";

export async function saveDevCode(phone: string, code: string): Promise<void> {
  if (!OTP_DEV_MODE) return;
  await prisma.otpDevCode.upsert({
    where: { phone },
    update: { code, createdAt: new Date() },
    create: { phone, code },
  });
}

export async function getDevCode(phone: string): Promise<string | null> {
  if (!OTP_DEV_MODE) return null;
  const row = await prisma.otpDevCode.findUnique({ where: { phone } });
  return row?.code ?? null;
}
