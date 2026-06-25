"use server";

import webpush from "web-push";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const vapidConfigured =
  !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY;

if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@rawatbhumi.id",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

type WebPushSub = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function subscribeUser(sub: WebPushSub) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth, userId: session.user.id },
    create: {
      userId: session.user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
  });
  return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  return { success: true };
}

/** Kirim push ke semua device milik 1 user. Hapus subscription yang sudah mati (410). */
export async function sendNotificationToUser(
  userId: string,
  payload: { title: string; body: string; url?: string; refId?: string }
) {
  if (!vapidConfigured) return { success: false, error: "VAPID belum dikonfigurasi" };

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  await Promise.all(
    subs.map((s) =>
      webpush
        .sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ icon: "/icons/icon-192.png", ...payload })
        )
        .catch(async (err: { statusCode?: number }) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await prisma.pushSubscription.deleteMany({ where: { endpoint: s.endpoint } });
          }
        })
    )
  );
  return { success: true };
}
