import { Wallet, Truck, Scale, Coins } from "lucide-react";
import { prisma } from "@/lib/db";
import { getKsatriaProfile } from "@/lib/ksatria";
import { calcKsatriaEarning } from "@/lib/business-rules";
import { rupiah } from "@/lib/format";
import { Card, StatCard, EmptyState, SectionTitle } from "@/components/ui/primitives";

export default async function PenghasilanPage() {
  const kp = await getKsatriaProfile();
  if (!kp) return <p className="text-sm text-gray-500">Bukan akun Ksatria.</p>;

  const startMonth = new Date();
  startMonth.setDate(1);
  startMonth.setHours(0, 0, 0, 0);

  const [recs, earnings] = await Promise.all([
    prisma.wasteRecord.findMany({ where: { ksatriaId: kp.id, recordedAt: { gte: startMonth } } }),
    prisma.ksatriaEarning.findMany({ where: { ksatriaId: kp.id }, orderBy: { period: "desc" }, take: 12 }),
  ]);

  const totalGrams = recs.reduce((a, b) => a + b.totalGrams, 0);
  const est = calcKsatriaEarning(recs.length, totalGrams);

  return (
    <div className="space-y-5 p-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-brand-dark">Penghasilan</h2>
        <p className="text-sm text-gray-500">Estimasi & riwayat pendapatanmu.</p>
      </div>

      <Card className="relative overflow-hidden bg-brand-dark p-5">
        <Wallet className="pointer-events-none absolute -right-3 -top-3 text-white/10" size={96} strokeWidth={1.4} />
        <p className="text-xs font-medium text-white/70">Estimasi bulan ini</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-white">{rupiah(est.totalAmount)}</p>
        <p className="mt-2 text-xs text-white/60">
          base {rupiah(est.baseAmount)} + bonus {rupiah(est.bonusAmount)}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Truck} tone="teal" value={recs.length} label="Pickup bulan ini" />
        <StatCard icon={Scale} tone="green" value={(totalGrams / 1000).toFixed(1)} suffix="kg" label="Total ditimbang" />
      </div>

      <section>
        <SectionTitle>Riwayat (per bulan)</SectionTitle>
        {earnings.length === 0 ? (
          <EmptyState
            icon={Coins}
            title="Belum ada penghasilan"
            hint="Penghasilan ter-finalisasi dihitung otomatis via cron tiap tanggal 28."
          />
        ) : (
          <div className="space-y-2.5">
            {earnings.map((e) => (
              <Card key={e.id} className="flex items-center justify-between p-3.5">
                <span className="text-sm font-medium text-gray-700">{e.period}</span>
                <span className="text-sm font-semibold text-brand-dark">{rupiah(e.totalAmount)}</span>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
