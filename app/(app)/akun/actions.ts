"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

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
