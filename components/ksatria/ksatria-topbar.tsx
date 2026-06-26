"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const TITLES: { href: string; title: string }[] = [
  { href: "/ksatria/beranda", title: "Beranda" },
  { href: "/ksatria/tugas", title: "Tugas" },
  { href: "/ksatria/penghasilan", title: "Penghasilan" },
  { href: "/ksatria/akun", title: "Akun" },
];

/** Topbar Ksatria: logo · judul tab aktif · lonceng notifikasi. */
export function KsatriaTopbar({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();
  const title = TITLES.find((t) => pathname === t.href || pathname.startsWith(t.href + "/"))?.title ?? "Ksatria";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-brand-dark/5 bg-white/90 px-4 py-3 backdrop-blur-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-rawat-bhumi.png" alt="Rawat Bhumi" className="h-[34px] w-auto shrink-0" />
      <h1 className="min-w-0 flex-1 truncate text-center text-base font-bold tracking-tight text-brand-dark">{title}</h1>
      <Link href="/ksatria/notifikasi" className="press relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-tint">
        <Bell size={18} className="text-brand-dark" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </header>
  );
}
