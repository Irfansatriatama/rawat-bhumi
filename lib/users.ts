import { auth } from "./auth";
import { prisma } from "./db";
import { USER_ROLE } from "./prisma-enums";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: string;
  rtId?: string | null;
  phone?: string | null;
  ksatria?: { employeeId: string; vehicleType?: string | null; vehiclePlate?: string | null };
};

/** Buat akun Better Auth + UserProfile (+ KsatriaProfile bila role ksatria). */
export async function createUserWithProfile(input: CreateUserInput) {
  const res = await auth.api.signUpEmail({
    body: { email: input.email, password: input.password, name: input.name },
  });
  const userId = res.user.id;

  const profile = await prisma.userProfile.create({
    data: { userId, role: input.role, rtId: input.rtId ?? null, phone: input.phone ?? null },
  });

  if (input.role === USER_ROLE.KSATRIA_BHUMI && input.ksatria) {
    await prisma.ksatriaProfile.create({
      data: {
        userId: profile.id,
        employeeId: input.ksatria.employeeId,
        vehicleType: input.ksatria.vehicleType ?? null,
        vehiclePlate: input.ksatria.vehiclePlate ?? null,
      },
    });
  }
  return profile;
}

/** Daftar profil per role, digabung dengan nama/email dari tabel Better Auth user. */
export async function listByRole(role: string) {
  const profiles = await prisma.userProfile.findMany({
    where: { role },
    include: { rt: true, ksatriaProfile: true },
    orderBy: { createdAt: "desc" },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: profiles.map((p) => p.userId) } },
    select: { id: true, name: true, email: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  return profiles.map((p) => ({
    ...p,
    name: byId.get(p.userId)?.name ?? "(tanpa nama)",
    email: byId.get(p.userId)?.email ?? "-",
  }));
}

/** Opsi Ksatria untuk dropdown (id = KsatriaProfile.id). */
export async function listKsatriaOptions() {
  const ks = await prisma.ksatriaProfile.findMany({ include: { userProfile: true } });
  const users = await prisma.user.findMany({
    where: { id: { in: ks.map((k) => k.userProfile.userId) } },
    select: { id: true, name: true },
  });
  const nameByUser = new Map(users.map((u) => [u.id, u.name]));
  return ks.map((k) => ({
    id: k.id,
    label: `${nameByUser.get(k.userProfile.userId) ?? k.employeeId} (${k.employeeId})`,
  }));
}

/** Nama warga dari UserProfile.id (chain: profile → user). */
export async function namesByProfileId(profileIds: string[]) {
  const profiles = await prisma.userProfile.findMany({ where: { id: { in: profileIds } } });
  const users = await prisma.user.findMany({
    where: { id: { in: profiles.map((p) => p.userId) } },
    select: { id: true, name: true },
  });
  const nameByUser = new Map(users.map((u) => [u.id, u.name]));
  const map = new Map<string, string>();
  profiles.forEach((p) => map.set(p.id, nameByUser.get(p.userId) ?? "(tanpa nama)"));
  return map;
}

/** Daftar ringkas semua user (untuk dropdown PBAC). */
export async function listAllProfiles() {
  const profiles = await prisma.userProfile.findMany({ orderBy: { role: "asc" } });
  const users = await prisma.user.findMany({
    where: { id: { in: profiles.map((p) => p.userId) } },
    select: { id: true, name: true, email: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  return profiles.map((p) => ({
    id: p.id,
    role: p.role,
    name: byId.get(p.userId)?.name ?? "(tanpa nama)",
    email: byId.get(p.userId)?.email ?? "-",
  }));
}
