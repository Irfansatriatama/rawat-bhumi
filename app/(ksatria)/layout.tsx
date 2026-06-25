import Link from "next/link";
import { requireRole } from "@/lib/guards";
import { USER_ROLE } from "@/lib/prisma-enums";
import { LogoutButton } from "@/components/auth/logout-button";

const TABS = [
  { href: "/ksatria/dashboard", label: "Tugas" },
  { href: "/ksatria/rute", label: "Rute" },
  { href: "/ksatria/timbang", label: "Timbang" },
  { href: "/ksatria/penghasilan", label: "Hasil" },
];

export default async function KsatriaLayout({ children }: { children: React.ReactNode }) {
  await requireRole([USER_ROLE.KSATRIA_BHUMI]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white">
      <header className="flex items-center justify-between bg-brand-dark px-5 py-3 text-white">
        <span className="font-semibold">Ksatria Bhumi</span>
        <LogoutButton />
      </header>
      <main className="flex-1 pb-20">{children}</main>
      <nav className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-[430px] -translate-x-1/2 justify-around border-t border-black/5 bg-white py-2">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="px-3 py-1 text-xs text-brand-dark">
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
