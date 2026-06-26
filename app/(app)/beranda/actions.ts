"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { dayKey, isSortCategory } from "@/lib/activity";

/** Tandai/lepas kategori pilah untuk HARI INI (toggle manual). */
export async function toggleSortCategory(category: string): Promise<{ success: boolean; active?: boolean; error?: string }> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const profileId = (session.user as { profileId?: string | null }).profileId;
  if (!profileId) return { success: false, error: "Profil tidak ditemukan" };
  if (!isSortCategory(category)) return { success: false, error: "Kategori tidak valid" };

  const date = dayKey();
  const existing = await prisma.dailySortLog.findUnique({
    where: { userId_date_category: { userId: profileId, date, category } },
  });

  let active: boolean;
  if (existing) {
    await prisma.dailySortLog.delete({ where: { id: existing.id } });
    active = false;
  } else {
    await prisma.dailySortLog.create({ data: { userId: profileId, date, category } });
    active = true;
  }

  revalidatePath("/beranda");
  revalidatePath("/beranda/aktivitas");
  return { success: true, active };
}
