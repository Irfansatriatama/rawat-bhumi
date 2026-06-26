"use client";

import {
  Bell, AlarmClock, Truck, MapPinCheck, CircleCheck, Star,
  Trophy, CreditCard, Megaphone, PackageCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { waktuRelatif } from "@/lib/format";
import { IconChip, EmptyState } from "@/components/ui/primitives";

type Tone = "green" | "amber" | "teal" | "lime" | "red" | "slate";

export type NotifItem = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string; // ISO
};

const STYLE: Record<string, { icon: LucideIcon; tone: Tone }> = {
  PICKUP_REMINDER: { icon: AlarmClock, tone: "teal" },
  PICKUP_ON_THE_WAY: { icon: Truck, tone: "green" },
  PICKUP_ARRIVED: { icon: MapPinCheck, tone: "green" },
  PICKUP_COMPLETED: { icon: CircleCheck, tone: "green" },
  PICKUP_NEW_REQUEST: { icon: PackageCheck, tone: "green" },
  POINTS_EARNED: { icon: Star, tone: "amber" },
  CHALLENGE_UPDATE: { icon: Trophy, tone: "lime" },
  PAYMENT_DUE: { icon: CreditCard, tone: "amber" },
  ANNOUNCEMENT: { icon: Megaphone, tone: "slate" },
};

export function NotificationList({ items }: { items: NotifItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="Belum ada notifikasi"
        hint="Pemberitahuan pickup, poin, dan info penting akan muncul di sini."
      />
    );
  }

  return (
    <ul className="space-y-2.5">
      {items.map((n) => {
        const s = STYLE[n.type] ?? { icon: Bell, tone: "green" as Tone };
        return (
          <li
            key={n.id}
            className={`relative flex gap-3 rounded-[var(--radius-card)] p-3.5 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)] ${
              n.isRead ? "bg-white" : "bg-brand-soft/40"
            }`}
          >
            <IconChip icon={s.icon} tone={s.tone} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-brand-dark">{n.title}</p>
                {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-red" />}
              </div>
              <p className="mt-0.5 text-[13px] leading-relaxed text-gray-500">{n.body}</p>
              <p className="mt-1 text-[11px] text-gray-400">{waktuRelatif(n.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
