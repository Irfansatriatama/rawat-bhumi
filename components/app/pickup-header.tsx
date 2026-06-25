"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Recycle } from "lucide-react";

const TABS = [
  { href: "/pickup", label: "Berikutnya" },
  { href: "/pickup/riwayat", label: "Riwayat" },
  { href: "/pickup/tracking", label: "Tracking" },
  { href: "/pickup/jadwal", label: "Jadwal" },
];

/** Topbar + tab navigasi bersama untuk seluruh seksi Pickup. */
export function PickupHeader({ unread = 1 }: { unread?: number }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-brand-dark/5 bg-white/90 backdrop-blur-lg">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <Link href="/beranda" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft">
            <Recycle size={20} strokeWidth={2.4} className="text-brand-600" />
          </span>
          <span className="text-[13px] font-bold leading-tight text-brand-dark">
            Rawat<br />Bhumi
          </span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-brand-dark">Pickup</h1>
        <Link href="/akun" className="press relative grid h-10 w-10 place-items-center">
          <Bell size={22} className="text-brand-dark" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </div>

      <nav className="flex px-2 text-sm">
        {TABS.map((t) => {
          const active = t.href === "/pickup" ? pathname === "/pickup" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative flex-1 px-1 pb-3 pt-1 text-center font-medium transition-colors ${
                active ? "text-brand-dark" : "text-gray-400"
              }`}
            >
              {t.label}
              {active && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-brand-600" />}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
