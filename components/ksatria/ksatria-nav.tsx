"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Map, Scale, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/ksatria/dashboard", label: "Tugas", icon: ClipboardList },
  { href: "/ksatria/rute", label: "Rute", icon: Map },
  { href: "/ksatria/timbang", label: "Timbang", icon: Scale },
  { href: "/ksatria/penghasilan", label: "Hasil", icon: Wallet },
];

/** Bottom-nav ksatria — sejajar dengan BottomNav warga (ikon + state aktif). */
export function KsatriaNav() {
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
