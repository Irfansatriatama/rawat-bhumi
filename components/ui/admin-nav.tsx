"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Truck, Scale, Recycle, Users, Wallet,
  BookOpen, FileBarChart, ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pickup", label: "Pickup", icon: Truck },
  { href: "/admin/waste-records", label: "Timbangan", icon: Scale },
  { href: "/admin/hilir", label: "Hilir & Revenue", icon: Recycle },
  { href: "/admin/users", label: "Warga & Ksatria", icon: Users },
  { href: "/admin/subscriptions", label: "Iuran", icon: Wallet },
  { href: "/admin/content", label: "Konten Edukasi", icon: BookOpen },
  { href: "/admin/reports/esg", label: "Laporan ESG", icon: FileBarChart },
  { href: "/admin/settings/roles", label: "Pengaturan (PBAC)", icon: ShieldCheck },
];

/** Sidebar admin — ikon + state aktif, bahasa visual sama dengan app warga. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-white/15 font-semibold text-white"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.3 : 1.9} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
