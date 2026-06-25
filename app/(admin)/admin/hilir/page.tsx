import { Wallet, TrendingDown, Scale, Package, Truck, Receipt } from "lucide-react";
import { prisma } from "@/lib/db";
import { DeliveryCreateForm } from "@/components/admin/delivery-create-form";
import { RevenueCreateForm } from "@/components/admin/revenue-create-form";
import { rupiah, tanggal } from "@/lib/format";
import { ENTRY_TYPE } from "@/lib/prisma-enums";
import { Card, StatCard, PageHeading, SectionTitle, EmptyState, StatusBadge } from "@/components/ui/primitives";

const STATUS_TONE: Record<string, "green" | "amber" | "teal" | "red" | "slate"> = {
  COMPLETED: "green",
  DONE: "green",
  DELIVERED: "green",
  SCHEDULED: "teal",
  PENDING: "amber",
  IN_PROGRESS: "amber",
  CANCELLED: "red",
};

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
  const totalTersalurkan = Object.values(weightByCat).reduce((a, b) => a + b, 0);

  return (
    <div>
      <PageHeading
        title="Hilir & Revenue"
        subtitle="4 jalur distribusi + ledger pendapatan/biaya (revenue engine)."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} tone="green" value={rupiah(revTotal)} label="Revenue (total)" />
        <StatCard icon={TrendingDown} tone="red" value={rupiah(costTotal)} label="Biaya (total)" />
        <StatCard icon={Scale} tone="teal" value={rupiah(revTotal - costTotal)} label="Net" />
        <StatCard icon={Package} tone="lime" value={totalTersalurkan.toFixed(1)} suffix="kg" label="Tersalurkan" />
      </div>

      <div className="mt-6 space-y-6">
        <DeliveryCreateForm partners={partners.map((p) => ({ id: p.id, name: p.name, type: p.type }))} />

        <div>
          <SectionTitle>
            Distribusi <span className="font-normal text-gray-400">({deliveries.length})</span>
          </SectionTitle>
          {deliveries.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="Belum ada distribusi"
              hint="Catat penyaluran sampah ke partner untuk melihat ringkasannya di sini."
            />
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-brand-dark/5 text-left text-xs uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tanggal</th>
                      <th className="px-4 py-3 font-medium">Kategori</th>
                      <th className="px-4 py-3 font-medium">Partner</th>
                      <th className="px-4 py-3 font-medium">Berat</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((d) => (
                      <tr key={d.id} className="border-b border-brand-dark/5 last:border-0">
                        <td className="px-4 py-3 text-brand-dark">{tanggal(d.deliveryDate)}</td>
                        <td className="px-4 py-3 text-gray-500">{d.category}</td>
                        <td className="px-4 py-3 text-gray-500">{d.partner.name}</td>
                        <td className="px-4 py-3 text-gray-500">{d.weightKg} kg</td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={STATUS_TONE[d.status] ?? "slate"}>{d.status}</StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <RevenueCreateForm />

        <div>
          <SectionTitle>
            Ledger <span className="font-normal text-gray-400">({revenue.length})</span>
          </SectionTitle>
          {revenue.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Belum ada entri"
              hint="Tambahkan entri pendapatan atau biaya untuk mengisi ledger."
            />
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-brand-dark/5 text-left text-xs uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Periode</th>
                      <th className="px-4 py-3 font-medium">Sumber</th>
                      <th className="px-4 py-3 font-medium">Tipe</th>
                      <th className="px-4 py-3 font-medium">Berat</th>
                      <th className="px-4 py-3 font-medium">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenue.map((r) => (
                      <tr key={r.id} className="border-b border-brand-dark/5 last:border-0">
                        <td className="px-4 py-3 text-brand-dark">{r.period}</td>
                        <td className="px-4 py-3 text-gray-500">{r.source}</td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={r.type === ENTRY_TYPE.COST ? "red" : "green"}>{r.type}</StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{r.weightKg ?? "-"}</td>
                        <td className="px-4 py-3 font-medium text-brand-dark">{rupiah(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
