"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead } from "./actions";

/**
 * Saat halaman notifikasi dibuka, tandai semua sebagai dibaca lalu refresh
 * supaya badge lonceng ikut nol. Hanya jalan sekali & bila ada yang belum dibaca.
 */
export function MarkReadOnView({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !hasUnread) return;
    ran.current = true;
    markAllNotificationsRead().then((res) => {
      if (res.success) router.refresh();
    });
  }, [hasUnread, router]);

  return null;
}
