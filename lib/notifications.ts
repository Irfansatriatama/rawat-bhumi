import { prisma } from "./db";
import { sendPushToUser } from "./push";

// Catatan: Notification.userId = Better Auth user.id (BUKAN UserProfile.id).

/** Daftar notifikasi terbaru milik satu user. */
export function listNotifications(userId: string, limit = 50) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Jumlah notifikasi belum dibaca (untuk badge lonceng). Aman jika DB error. */
export function unreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } }).catch(() => 0);
}

/** Tandai semua notifikasi user sebagai sudah dibaca. */
export function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

/**
 * Buat satu notifikasi (DB) lalu kirim Web Push best-effort.
 * Satu pintu untuk semua titik yang memunculkan notifikasi (warga & ksatria).
 */
export async function notifyUser(
  userId: string,
  n: { title: string; body: string; type: string; refId?: string | null; url?: string },
) {
  await prisma.notification.create({
    data: { userId, title: n.title, body: n.body, type: n.type, refId: n.refId ?? null },
  });
  await sendPushToUser(userId, {
    title: n.title,
    body: n.body,
    url: n.url,
    refId: n.refId ?? undefined,
  }).catch(() => {});
}
