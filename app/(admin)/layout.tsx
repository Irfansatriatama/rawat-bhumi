import Link from "next/link";
import { requireRole, ADMIN_ROLE_LIST } from "@/lib/guards";
import { LogoutButton } from "@/components/auth/logout-button";

const NAV: { href: string; label: string; ready: boolean }[] = [
  { href: "/admin/dashboard", label: "Dashboard", ready: true },
  { href: "/admin/pickup", label: "Pickup", ready: true },
  { href: "/admin/waste-records", label: "Timbangan", ready: true },
  { href: "/admin/hilir", label: "Hilir & Revenue", ready: true },
  { href: "/admin/users", label: "Warga & Ksatria", ready: true },
  { href: "/admin/subscriptions", label: "Iuran", ready: true },
  { href: "/admin/content", label: "Konten Edukasi", ready: true },
  { href: "/admin/reports/esg", label: "Laporan ESG", ready: true },
  { href: "/admin/settings/roles", label: "Pengaturan (PBAC)", ready: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session } = await requireRole(ADMIN_ROLE_LIST);

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <aside className="hidden w-60 shrink-0 flex-col bg-brand-dark p-4 text-white md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-brand-dark text-sm font-bold">
            RB
          </span>
          <span className="font-semibold">Rawat Bhumi</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) =>
            item.ready ? (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-white/40"
              >
                {item.label}
                <span className="text-[10px] uppercase">segera</span>
              </span>
            )
          )}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-3">
          <span className="text-sm text-gray-500">Admin · {(session.user as { role?: string }).role}</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{session.user.email}</span>
            <span className="text-gray-300">|</span>
            <LogoutButton className="text-sm text-gray-500 hover:text-brand-red" />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
