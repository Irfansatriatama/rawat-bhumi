import { prisma } from "@/lib/db";
import { DeliveryCreateForm } from "@/components/admin/delivery-create-form";
import { RevenueCreateForm } from "@/components/admin/revenue-create-form";
import { rupiah, tanggal } from "@/lib/format";
import { ENTRY_TYPE } from "@/lib/prisma-enums";

function Card({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent ?? "text-brand-dark"}`}>{value}</p>
    </div>
  );
}

export default async function HilirPage() {
  const [partners, deliveries, revenue] = await Promise.all([
    prisma.partner.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.wasteDelivery.findMany({ orderBy: { deliveryDate: "desc" }, take: 50, include: { partner: true } }),
    prisma.revenueEntry.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  const revTotal = revenue.filter((r) => r.type === ENTRY_TYPE.REVENUE).reduce((a, b) => a + b.amount, 0);
  const costTotal = revenue.filter((r) => r.type === ENTRY_TYPE.COST).reduce((a, b) => a + b.amount, 0);
  const weightByCat = deliveries.reduce<Record<string, number>>((acc, d) => {
    acc[d.category] = (acc[d.category] ?? 0) + d.weightKg;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-dark">Hilir & Revenue</h1>
        <p className="text-sm text-gray-500">4 jalur distribusi + ledger pendapatan/biaya (revenue engine).</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card label="Revenue (total)" value={rupiah(revTotal)} accent="text-brand-dark" />
        <Card label="Biaya (total)" value={rupiah(costTotal)} accent="text-brand-red" />
        <Card label="Net" value={rupiah(revTotal - costTotal)} />
        <Card
          label="Tersalurkan"
          value={`${Object.values(weightByCat).reduce((a, b) => a + b, 0).toFixed(1)} kg`}
        />
      </div>

      <DeliveryCreateForm partners={partners.map((p) => ({ id: p.id, name: p.name, type: p.type }))} />

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 font-semibold text-brand-dark">Distribusi <span className="text-sm font-normal text-gray-400">({deliveries.length})</span></h2>
        {deliveries.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada distribusi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500"><tr className="border-b border-black/5">
                <th className="py-2 pr-4">Tanggal</th><th className="py-2 pr-4">Kategori</th>
                <th className="py-2 pr-4">Partner</th><th className="py-2 pr-4">Berat</th><th className="py-2 pr-4">Status</th>
              </tr></thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-b border-black/5 last:border-0 text-gray-700">
                    <td className="py-2 pr-4">{tanggal(d.deliveryDate)}</td>
                    <td className="py-2 pr-4">{d.category}</td>
                    <td className="py-2 pr-4">{d.partner.name}</td>
                    <td className="py-2 pr-4">{d.weightKg} kg</td>
                    <td className="py-2 pr-4"><span className="rounded-full bg-brand-bg px-2 py-0.5 text-xs">{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RevenueCreateForm />

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 font-semibold text-brand-dark">Ledger <span className="text-sm font-normal text-gray-400">({revenue.length})</span></h2>
        {revenue.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada entri.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500"><tr className="border-b border-black/5">
                <th className="py-2 pr-4">Periode</th><th className="py-2 pr-4">Sumber</th>
                <th className="py-2 pr-4">Tipe</th><th className="py-2 pr-4">Berat</th><th className="py-2 pr-4">Jumlah</th>
              </tr></thead>
              <tbody>
                {revenue.map((r) => (
                  <tr key={r.id} className="border-b border-black/5 last:border-0 text-gray-700">
                    <td className="py-2 pr-4">{r.period}</td>
                    <td className="py-2 pr-4">{r.source}</td>
                    <td className="py-2 pr-4">
                      <span className={r.type === ENTRY_TYPE.COST ? "text-brand-red" : "text-brand-dark"}>{r.type}</span>
                    </td>
                    <td className="py-2 pr-4">{r.weightKg ?? "-"}</td>
                    <td className="py-2 pr-4 font-medium">{rupiah(r.amount)}</td>
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
