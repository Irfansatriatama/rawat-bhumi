"use client";

import { useEffect, useState, useTransition } from "react";
import { subscribeUser, unsubscribeUser } from "@/app/actions";
import { Spinner } from "@/components/ui/loading";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const reg = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    setSubscription(await reg.pushManager.getSubscription());
  }

  async function subscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    setSubscription(sub);
    await subscribeUser(JSON.parse(JSON.stringify(sub)));
  }

  async function unsubscribe() {
    const endpoint = subscription?.endpoint;
    await subscription?.unsubscribe();
    setSubscription(null);
    if (endpoint) await unsubscribeUser(endpoint);
  }

  if (!isSupported) return <p>Push notification tidak didukung di browser ini.</p>;

  return subscription ? (
    <button
      onClick={() => startTransition(() => unsubscribe())}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 disabled:opacity-60"
    >
      {isPending && <Spinner size={16} />}
      Nonaktifkan notifikasi
    </button>
  ) : (
    <button
      onClick={() => startTransition(() => subscribe())}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 disabled:opacity-60"
    >
      {isPending && <Spinner size={16} />}
      Aktifkan notifikasi
    </button>
  );
}
