import Link from "next/link";
import { CreditCard, Recycle, CalendarClock, BadgeCheck, ChevronRight } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { tanggal } from "@/lib/format";
import { SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS } from "@/lib/prisma-enums";
import { AppHeader } from "@/components/ui/app-header";
import { Card, EmptyState } from "@/components/ui/primitives";

const PLAN_LABEL: Record<string, { name: string; price: string; freq: string }> = {
  [SUBSCRIPTION_PLAN.RUMAH_TANGGA]: { name: "Paket Rumah Tangga", price: "Rp 50.000/bulan", freq: "Organik harian · anorganik/B3 mingguan" },
  [SUBSCRIPTION_PLAN.PREMIUM]: { name: "Paket Komunitas / UMKM", price: "Rp 75.000/bulan", freq: "Volume besar · prioritas jadwal" },
};

export default async function PaketSayaPage() {
  const session = await getSession();
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session!.user.id },
    include: { subscription: true },
  });
  const sub = profile?.subscription;
  const info = sub ? PLAN_LABEL[sub.plan] ?? { name: sub.plan, price: "-", freq: "-" } : null;
  const active = sub?.status === SUBSCRIPTION_STATUS.ACTIVE;

  return (
    <div className="bg-brand-tint pb-6">
      <AppHeader title="Paket Saya" subtitle="Langganan layanan pickup" icon={CreditCard} />
      <div className="space-y-3 p-4">
        {!sub || !info ? (
          <>
            <EmptyState icon={CreditCard} title="Belum berlangganan" hint="Pilih paket untuk mulai layanan penjemputan." />
            <Link href="/onboarding/paket" className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-dark py-3.5 text-sm font-semibold text-white">
              Pilih Paket
            </Link>
          </>
        ) : (
          <>
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-600">
                  <Recycle size={24} />
                </span>
                <div className="flex-1">
                  <p className="font-bold text-brand-dark">{info.name}</p>
                  <p className="text-sm font-semibold text-brand-600">{info.price}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? "bg-brand-soft text-brand-600" : "bg-amber-100 text-brand-amber"}`}>
                  {active ? <><BadgeCheck size={12} /> Aktif</> : "Perlu bayar"}
                </span>
              </div>
              <p className="mt-3 text-xs text-gray-500">{info.freq}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-brand-dark/5 pt-4 text-sm">
                <div>
                  <p className="text-[11px] text-gray-400">Mulai</p>
                  <p className="font-medium text-brand-dark">{tanggal(sub.startDate)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarClock size={15} className="text-brand-600" />
                  <div>
                    <p className="text-[11px] text-gray-400">Tagihan berikutnya</p>
                    <p className="font-medium text-brand-dark">{tanggal(sub.nextBillDate)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Link href="/akun/pembayaran" className="press flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-brand-dark/5">
              <CreditCard size={18} className="text-brand-600" />
              <span className="flex-1 text-sm font-medium text-brand-dark">Pembayaran & Tagihan</span>
              <ChevronRight size={17} className="text-gray-300" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
