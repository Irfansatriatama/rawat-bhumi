import { CheckCircle2, Clock, Wallet, Receipt } from "lucide-react";
import { prisma } from "@/lib/db";
import { namesByProfileId } from "@/lib/users";
import { rupiah, tanggal } from "@/lib/format";
import { PAYMENT_STATUS } from "@/lib/prisma-enums";
import { Card, StatCard, PageHeading, StatusBadge, EmptyState } from "@/components/ui/primitives";
import { GenerateInvoicesButton, VerifyPaymentButton } from "@/components/admin/subscription-actions";

export default async function SubscriptionsPage() {
  const payments = await prisma.subscriptionPayment.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { subscription: true },
  });
  const names = await namesByProfileId(payments.map((p) => p.subscription.userId));

  const paid = payments.filter((p) => p.status === PAYMENT_STATUS.PAID);
  const totalPaid = paid.reduce((a, b) => a + b.amount, 0);

  return (
    <div>
      <PageHeading
        title="Iuran & Pembayaran"
        subtitle="Iuran Rp 50.000/KK/bulan. QRIS (dummy) atau tunai (verifikasi admin)."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={CheckCircle2} tone="green" value={paid.length} label="Lunas" />
        <StatCard icon={Clock} tone="red" value={payments.length - paid.length} label="Belum bayar" />
        <StatCard icon={Wallet} tone="teal" value={rupiah(totalPaid)} label="Total masuk" />
      </div>

      <Card className="mt-4 p-5">
        <GenerateInvoicesButton />
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="px-5 pt-5">
          <h2 className="font-semibold text-brand-dark">
            Tagihan <span className="text-sm font-normal text-gray-400">({payments.length})</span>
          </h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Receipt} title="Belum ada tagihan" hint="Klik “Generate Tagihan” untuk membuat tagihan baru." />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-brand-dark/5 text-left text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Warga</th>
                  <th className="px-4 py-3 font-medium">Jumlah</th>
                  <th className="px-4 py-3 font-medium">Metode</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-brand-dark/5 last:border-0">
                    <td className="px-4 py-3 font-medium text-brand-dark">{names.get(p.subscription.userId) ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{rupiah(p.amount)}</td>
                    <td className="px-4 py-3 text-gray-700">{p.method}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={p.status === PAYMENT_STATUS.PAID ? "green" : "amber"}>{p.status}</StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.paidAt ? tanggal(p.paidAt) : "-"}</td>
                    <td className="px-4 py-3">
                      {p.status !== PAYMENT_STATUS.PAID && <VerifyPaymentButton paymentId={p.id} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
