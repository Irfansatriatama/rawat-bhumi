import Link from "next/link";
import { History, Recycle, Sprout, Trash2, TriangleAlert, Coins, Cloud, CalendarDays, Scale, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { tanggal } from "@/lib/format";
import { Card, IconChip, EmptyState, StatCard } from "@/components/ui/primitives";
import { PickupHeader } from "@/components/app/pickup-header";

function gr(g: number): string {
  return g >= 1000 ? `${(g / 1000).toFixed(1)} kg` : `${g} g`;
}

export default async function RiwayatPage() {
  const session = await getSessionLike();
  const records = session?.profileId
    ? await prisma.wasteRecord.findMany({
        where: { userId: session.profileId },
        orderBy: { recordedAt: "desc" },
        take: 50,
      })
    : [];

  const totalKg = records.reduce((s, r) => s + r.totalGrams, 0) / 1000;
  const totalPts = records.reduce((s, r) => s + r.pointsEarned, 0);
  const totalCo2 = records.reduce((s, r) => s + r.co2ReducedKg, 0);

  const cats = (r: (typeof records)[number]): { icon: LucideIcon; tone: "lime" | "teal" | "slate" | "red"; label: string; g: number }[] => [
    { icon: Sprout, tone: "lime", label: "Organik", g: r.organikGrams },
    { icon: Recycle, tone: "teal", label: "Anorganik", g: r.anorganikGrams },
    { icon: Trash2, tone: "slate", label: "Residu", g: r.residuGrams },
    { icon: TriangleAlert, tone: "red", label: "B3", g: r.b3Grams },
  ];

  return (
    <div className="bg-brand-tint">
      <PickupHeader />

      <div className="space-y-4 p-4">
        {records.length === 0 ? (
          <EmptyState icon={History} title="Belum ada riwayat" hint="Setoran sampah yang sudah ditimbang kurir akan tercatat di sini." />
        ) : (
          <>
            {/* Ringkasan total */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={Scale} tone="green" value={totalKg.toFixed(0)} suffix="kg" label="Total setor" />
              <StatCard icon={Coins} tone="amber" value={totalPts.toLocaleString("id-ID")} label="Poin" />
              <StatCard icon={Cloud} tone="teal" value={totalCo2.toFixed(0)} suffix="kg" label="CO₂" />
            </div>

            {/* Daftar setoran */}
            <div className="space-y-3">
              {records.map((r) => (
                <Link key={r.id} href={`/pickup/riwayat/${r.id}`} className="block">
                <Card className="press p-4">
                  <div className="flex items-center gap-3">
                    <IconChip icon={CalendarDays} tone="green" size={42} />
                    <div className="flex-1">
                      <p className="font-semibold text-brand-dark">{tanggal(r.recordedAt)}</p>
                      <p className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1 text-brand-600"><Coins size={11} /> +{r.pointsEarned}</span>
                        <span className="flex items-center gap-1"><Cloud size={11} /> {r.co2ReducedKg.toFixed(1)} kg CO₂</span>
                      </p>
                    </div>
                    <span className="text-lg font-bold text-brand-dark">{(r.totalGrams / 1000).toFixed(1)}<span className="text-xs font-medium text-gray-400"> kg</span></span>
                    <ChevronRight size={16} className="shrink-0 text-gray-300" />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 border-t border-brand-dark/5 pt-3">
                    {cats(r).map((c) => (
                      <div key={c.label} className="flex flex-col items-center gap-1 text-center">
                        <IconChip icon={c.icon} tone={c.tone} size={32} />
                        <p className="text-[11px] font-semibold text-brand-dark">{gr(c.g)}</p>
                        <p className="text-[10px] leading-none text-gray-400">{c.label}</p>
                      </div>
                    ))}
                  </div>
                </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
