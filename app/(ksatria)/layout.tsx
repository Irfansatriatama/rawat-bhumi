import { Truck } from "lucide-react";
import { requireRole } from "@/lib/guards";
import { USER_ROLE } from "@/lib/prisma-enums";
import { LogoutButton } from "@/components/auth/logout-button";
import { KsatriaNav } from "@/components/ksatria/ksatria-nav";

export default async function KsatriaLayout({ children }: { children: React.ReactNode }) {
  await requireRole([USER_ROLE.KSATRIA_BHUMI]);

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-brand-tint">
      <header className="app-header relative overflow-hidden rounded-b-[28px] px-5 pb-6 pt-9 text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <Truck className="pointer-events-none absolute -bottom-4 right-2 text-white/10" size={96} strokeWidth={1.2} />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
              <Truck size={18} className="text-white" />
            </span>
            <div className="leading-tight">
              <p className="text-[11px] font-medium text-brand-lime">Ksatria Bhumi</p>
              <h1 className="text-lg font-semibold tracking-tight">Mitra Penjemput</h1>
            </div>
          </div>
          <LogoutButton className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20" />
        </div>
      </header>
      <main className="flex-1 pb-24">{children}</main>
      <KsatriaNav />
    </div>
  );
}
