import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession } from "better-auth/plugins";
import { prisma } from "./db";
import { USER_ROLE } from "./prisma-enums";

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
