import { prisma } from "@/lib/db";
import { rupiah, tanggalJam } from "@/lib/format";
import { EsgGenerate } from "@/components/admin/esg-generate";

export default async function EsgReportsPage() {
  const reports = await prisma.eSGReport.findMany({ orderBy: { generatedAt: "desc" }, take: 30 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-dark">Laporan ESG</h1>
        <p className="text-sm text-gray-500">Untuk Yayasan AHM — data + narasi Gemini (per periode YYYY-MM).</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <EsgGenerate />
      </div>

      {reports.length === 0 ? (
        <p className="text-sm text-gray-400">Belum ada laporan. Generate untuk periode tertentu.</p>
      ) : (
        reports.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-brand-dark">Periode {r.period}</h2>
              <span className="text-xs text-gray-400">{tanggalJam(r.generatedAt)}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <Stat label="Total" value={`${r.totalWeightKg.toFixed(1)} kg`} />
              <Stat label="Organik" value={`${r.organikKg.toFixed(1)} kg`} />
              <Stat label="CO₂ dicegah" value={`${r.co2ReducedKg.toFixed(1)} kg`} />
              <Stat label="KK aktif" value={String(r.activeKK)} />
              <Stat label="Revenue" value={rupiah(r.revenueTotal)} />
              <Stat label="Biaya" value={rupiah(r.costTotal)} />
              <Stat label="Ksatria" value={String(r.ksatriaCount)} />
            </div>
            {r.narrative && <p className="mt-3 rounded-lg bg-brand-bg p-3 text-sm text-gray-600">{r.narrative}</p>}
          </div>
        ))
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-brand-bg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-brand-dark">{value}</p>
    </div>
  );
}
