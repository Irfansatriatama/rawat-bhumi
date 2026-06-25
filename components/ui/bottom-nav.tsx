"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Truck, GraduationCap, Users, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/beranda", label: "Beranda", icon: Home },
  { href: "/pickup", label: "Pickup", icon: Truck },
  { href: "/belajar", label: "Belajar", icon: GraduationCap },
  { href: "/komunitas", label: "Komunitas", icon: Users },
  { href: "/akun", label: "Akun", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t border-brand-dark/5 bg-white/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg">
      <ul className="flex items-stretch justify-around">
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          const Icon = t.icon;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className="press flex flex-col items-center gap-1 py-1"
              >
                <span
                  className={`grid h-9 w-12 place-items-center rounded-full transition-colors ${
                    active ? "bg-brand-soft" : "bg-transparent"
                  }`}
                >
                  <Icon
                    size={21}
                    strokeWidth={active ? 2.4 : 1.9}
                    className={active ? "text-brand-600" : "text-gray-400"}
                  />
                </span>
                <span
                  className={`text-[10.5px] leading-none ${
                    active ? "font-semibold text-brand-dark" : "text-gray-400"
                  }`}
                >
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
