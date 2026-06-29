import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession, phoneNumber } from "better-auth/plugins";
import { prisma } from "./db";
import { USER_ROLE } from "./prisma-enums";
import { saveDevCode } from "./otp-dev";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: { enabled: true },

  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 hari
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  plugins: [
    // Onboarding self-serve via nomor HP + OTP (dev-mode: kode tampil di layar).
    phoneNumber({
      otpLength: 6,
      expiresIn: 10 * 60, // 10 menit
      allowedAttempts: 5,
      sendOTP: async ({ phoneNumber: phone, code }) => {
        await saveDevCode(phone, code).catch(() => {});
        console.log(`[OTP dev] ${phone} → ${code}`);
      },
      // Verifikasi pertama untuk nomor baru → buat akun warga otomatis.
      signUpOnVerification: {
        getTempEmail: (phone) => `${phone.replace(/[^0-9]/g, "")}@warga.rawatbhumi.id`,
        getTempName: (phone) => phone,
      },
      // Pastikan UserProfile ada (warga baru = provisional sampai gabung RT).
      callbackOnVerification: async ({ phoneNumber: phone, user }) => {
        const existing = await prisma.userProfile.findUnique({ where: { userId: user.id } });
        if (!existing) {
          await prisma.userProfile.create({
            data: { userId: user.id, role: USER_ROLE.WARGA, phone, isProvisional: true },
          });
        } else if (!existing.phone) {
          await prisma.userProfile.update({ where: { userId: user.id }, data: { phone } });
        }
      },
    }),
    // Tutup blocker: sertakan role + profileId domain ke dalam session.
    // (Better Auth core tidak tahu UserProfile; kita enrich di sini.)
    customSession(async ({ user, session }) => {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
        select: { id: true, role: true, rtId: true },
      });
      return {
        session,
        user: {
          ...user,
          role: profile?.role ?? USER_ROLE.WARGA,
          profileId: profile?.id ?? null,
          rtId: profile?.rtId ?? null,
        },
      };
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
