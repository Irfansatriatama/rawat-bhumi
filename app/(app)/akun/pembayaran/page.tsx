import { Wallet, Receipt, CalendarClock, CheckCircle2, CreditCard } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { rupiah, tanggal } from "@/lib/format";
import { PAYMENT_STATUS, SUBSCRIPTION_PLAN } from "@/lib/prisma-enums";
import { PayButton } from "@/components/app/pay-button";
import { AppHeader } from "@/components/ui/app-header";
import { Card, IconChip, EmptyState, StatusBadge } from "@/components/ui/primitives";

const PLAN_LABEL: Record<string, string> = {
  [SUBSCRIPTION_PLAN.RUMAH_TANGGA]: "Paket Rumah Tangga",
  [SUBSCRIPTION_PLAN.PREMIUM]: "Paket Premium",
};
const PSTATUS: Record<string, { label: string; tone: "green" | "amber" | "red" | "slate" | "teal" }> = {
  [PAYMENT_STATUS.PAID]: { label: "Lunas", tone: "green" },
  [PAYMENT_STATUS.PENDING]: { label: "Belum dibayar", tone: "amber" },
  [PAYMENT_STATUS.FAILED]: { label: "Gagal", tone: "red" },
  [PAYMENT_STATUS.EXPIRED]: { label: "Kedaluwarsa", tone: "slate" },
  [PAYMENT_STATUS.REFUNDED]: { label: "Dikembalikan", tone: "teal" },
};

export default async function PembayaranPage() {
  const session = await getSessionLike();
  const sub = session?.profileId
    ? await prisma.subscription.findUnique({ where: { userId: session.profileId } })
    : null;
  const payments = sub
    ? await prisma.subscriptionPayment.findMany({ where: { subscriptionId: sub.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div>
      <AppHeader title="Pembayaran & Tagihan" subtitle="Kelola iuran langganan kamu" icon={Wallet} />

      <div className="space-y-4 p-5">
        {/* Ringkasan langganan */}
        {sub && (
          <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-brand-600 to-brand-dark p-5 text-white [box-shadow:var(--shadow-pop)]">
            <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
            <div className="relative flex items-center gap-1.5 text-white/80">
              <CreditCard size={15} />
              <p className="text-xs font-medium">{PLAN_LABEL[sub.plan] ?? sub.plan}</p>
            </div>
            <p className="relative mt-1 text-2xl font-bold tracking-tight">Rp 50.000 <span className="text-sm font-medium text-white/70">/ bulan</span></p>
            <div className="relative mt-3 flex items-center gap-1.5 border-t border-white/15 pt-3 text-xs text-white/80">
              <CalendarClock size={13} /> Tagihan berikutnya {tanggal(sub.nextBillDate)}
            </div>
          </div>
        )}

        <h2 className="px-1 text-sm font-bold text-brand-dark">Riwayat tagihan</h2>

        {payments.length === 0 ? (
          <EmptyState icon={Receipt} title="Belum ada tagihan" hint="Tagihan bulanan akan tampil di sini setelah diterbitkan admin." />
        ) : (
          <div className="space-y-3">
            {payments.map((p) => {
              const st = PSTATUS[p.status] ?? { label: p.status, tone: "slate" as const };
              const paid = p.status === PAYMENT_STATUS.PAID;
              return (
                <Card key={p.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <IconChip icon={paid ? CheckCircle2 : Receipt} tone={paid ? "green" : "amber"} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-brand-dark">{rupiah(p.amount)}</p>
                      <p className="text-xs text-gray-500">
                        {p.paidAt ? `Dibayar ${tanggal(p.paidAt)}` : `Terbit ${tanggal(p.createdAt)}`}
                      </p>
                    </div>
                    <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                  </div>
                  {!paid && (
                    <div className="mt-3 border-t border-brand-dark/5 pt-3">
                      <PayButton paymentId={p.id} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
