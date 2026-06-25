import { prisma } from "@/lib/db";
import { getKsatriaProfile } from "@/lib/ksatria";
import { calcKsatriaEarning } from "@/lib/business-rules";
import { rupiah } from "@/lib/format";

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
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-brand-dark">Penghasilan</h1>

      <div className="rounded-2xl bg-brand-dark p-5 text-white">
        <p className="text-sm text-white/70">Estimasi bulan ini</p>
        <p className="mt-1 text-3xl font-bold">{rupiah(est.totalAmount)}</p>
        <p className="mt-1 text-xs text-white/60">
          {recs.length} pickup · {(totalGrams / 1000).toFixed(1)} kg · base {rupiah(est.baseAmount)} + bonus {rupiah(est.bonusAmount)}
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-500">Riwayat (per bulan)</h2>
        {earnings.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada penghasilan ter-finalisasi (dihitung via cron tgl 28).</p>
        ) : (
          earnings.map((e) => (
            <div key={e.id} className="flex justify-between rounded-xl bg-white p-3 text-sm ring-1 ring-black/5">
              <span className="text-gray-700">{e.period}</span>
              <span className="font-medium text-brand-dark">{rupiah(e.totalAmount)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
