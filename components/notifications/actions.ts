"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { markAllRead } from "@/lib/notifications";

/** Tandai semua notifikasi user aktif sebagai dibaca (dipakai warga & ksatria). */
export async function markAllNotificationsRead() {
  const session = await getSession();
  if (!session) return { success: false };
  await markAllRead(session.user.id);
  revalidatePath("/notifikasi");
  revalidatePath("/ksatria/notifikasi");
  revalidatePath("/akun");
  return { success: true };
}
