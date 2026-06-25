import { prisma } from "@/lib/db";
import { namesByProfileId } from "@/lib/users";
import { rupiah, tanggal } from "@/lib/format";
import { PAYMENT_STATUS } from "@/lib/prisma-enums";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-dark">Iuran & Pembayaran</h1>
        <p className="text-sm text-gray-500">Iuran Rp 50.000/KK/bulan. QRIS (dummy) atau tunai (verifikasi admin).</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-gray-500">Lunas</p>
          <p className="text-2xl font-semibold text-brand-dark">{paid.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-gray-500">Belum bayar</p>
          <p className="text-2xl font-semibold text-brand-red">{payments.length - paid.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-gray-500">Total masuk</p>
          <p className="text-2xl font-semibold text-brand-dark">{rupiah(totalPaid)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <GenerateInvoicesButton />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 font-semibold text-brand-dark">Tagihan <span className="text-sm font-normal text-gray-400">({payments.length})</span></h2>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada tagihan. Klik “Generate Tagihan”.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500"><tr className="border-b border-black/5">
                <th className="py-2 pr-4">Warga</th><th className="py-2 pr-4">Jumlah</th>
                <th className="py-2 pr-4">Metode</th><th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Tanggal</th><th className="py-2 pr-4">Aksi</th>
              </tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-black/5 last:border-0 text-gray-700">
                    <td className="py-2 pr-4">{names.get(p.subscription.userId) ?? "-"}</td>
                    <td className="py-2 pr-4">{rupiah(p.amount)}</td>
                    <td className="py-2 pr-4">{p.method}</td>
                    <td className="py-2 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === PAYMENT_STATUS.PAID ? "bg-green-100 text-brand-dark" : "bg-gray-100 text-gray-500"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{p.paidAt ? tanggal(p.paidAt) : "-"}</td>
                    <td className="py-2 pr-4">
                      {p.status !== PAYMENT_STATUS.PAID && <VerifyPaymentButton paymentId={p.id} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
