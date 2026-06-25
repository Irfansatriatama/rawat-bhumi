"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { uploadAvatar } from "@/lib/cloudinary";

export async function updateProfil(data: { name: string; phone: string }) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const name = data.name.trim();
  if (!name) return { success: false, error: "Nama tidak boleh kosong" };

  await prisma.user.update({ where: { id: session.user.id }, data: { name } });
  await prisma.userProfile.update({
    where: { userId: session.user.id },
    data: { phone: data.phone.trim() || null },
  });
  revalidatePath("/akun");
  return { success: true };
}

export async function updateAvatar(data: { image: string }) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const img = data.image?.trim();
  if (!img.startsWith("data:image/")) return { success: false, error: "Format gambar tidak valid" };
  // Batas wajar untuk data URL terkompresi (~256px). 1 char ≈ 1 byte.
  if (img.length > 700_000) return { success: false, error: "Gambar terlalu besar, coba foto lain" };

  const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return { success: false, error: "Profil tidak ditemukan" };

  let url: string;
  try {
    url = await uploadAvatar(img, profile.id);
  } catch {
    return { success: false, error: "Gagal mengunggah foto. Coba lagi." };
  }

  await prisma.userProfile.update({ where: { id: profile.id }, data: { avatarUrl: url } });
  revalidatePath("/akun");
  revalidatePath("/akun/profil");
  return { success: true, url };
}

export async function removeAvatar() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  await prisma.userProfile.update({
    where: { userId: session.user.id },
    data: { avatarUrl: null },
  });
  revalidatePath("/akun");
  revalidatePath("/akun/profil");
  return { success: true };
}

export async function updateAlamat(data: { address: string }) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  await prisma.userProfile.update({
    where: { userId: session.user.id },
    data: { address: data.address.trim() || null },
  });
  revalidatePath("/akun");
  revalidatePath("/pickup");
  return { success: true };
}
