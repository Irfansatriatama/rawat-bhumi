import { requireRole, ADMIN_ROLE_LIST } from "@/lib/guards";
import { LogoutButton } from "@/components/auth/logout-button";
import { AdminNav } from "@/components/ui/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session } = await requireRole(ADMIN_ROLE_LIST);
  const role = (session.user as { role?: string }).role;

  return (
    <div className="flex min-h-screen bg-brand-tint">
      <aside className="app-header sticky top-0 hidden h-screen w-64 shrink-0 flex-col p-4 text-white md:flex">
        <div className="mb-6 flex items-center gap-2.5 px-2 pt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="Rawat Bhumi" className="h-9 w-9 rounded-xl" />
          <div className="leading-tight">
            <p className="font-semibold">Rawat Bhumi</p>
            <p className="text-[11px] text-white/60">Panel Admin</p>
          </div>
        </div>
        <AdminNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-dark/5 bg-white/90 px-6 py-3 backdrop-blur-lg">
          <span className="inline-flex items-center gap-2 text-sm text-gray-500">
            Admin
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-600">{role}</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-700 sm:inline">{session.user.email}</span>
            <span className="hidden text-gray-300 sm:inline">|</span>
            <LogoutButton className="text-sm text-gray-500 hover:text-brand-red" />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
