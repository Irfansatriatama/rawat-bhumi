import { FileBarChart } from "lucide-react";
import { prisma } from "@/lib/db";
import { rupiah, tanggalJam } from "@/lib/format";
import { Card, PageHeading, EmptyState } from "@/components/ui/primitives";
import { EsgGenerate } from "@/components/admin/esg-generate";

export default async function EsgReportsPage() {
  const reports = await prisma.eSGReport.findMany({ orderBy: { generatedAt: "desc" }, take: 30 });

  return (
    <div>
      <PageHeading
        title="Laporan ESG"
        subtitle="Untuk Yayasan AHM — data + narasi Gemini (per periode YYYY-MM)."
      />

      <Card className="p-5">
        <EsgGenerate />
      </Card>

      {reports.length === 0 ? (
        <Card className="mt-4 p-5">
          <EmptyState icon={FileBarChart} title="Belum ada laporan" hint="Generate laporan untuk periode tertentu." />
        </Card>
      ) : (
        <div className="mt-4 space-y-4">
          {reports.map((r) => (
            <Card key={r.id} className="p-5">
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
              {r.narrative && (
                <p className="mt-3 rounded-lg bg-brand-tint p-3 text-sm leading-relaxed text-gray-600">{r.narrative}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-brand-tint p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-brand-dark">{value}</p>
    </div>
  );
}
