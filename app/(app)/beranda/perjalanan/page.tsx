import Link from "next/link";
import {
  ChevronLeft, Truck, Scale, Navigation, Recycle, Sparkles, Check,
  Info, Package, Cloud, MapPin, Route,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getWasteJourney, type JourneyStageKey } from "@/lib/journey";
import { tanggalJam } from "@/lib/format";
import { Card, EmptyState } from "@/components/ui/primitives";

const STAGE_ICON: Record<JourneyStageKey, LucideIcon> = {
  dijemput: Truck,
  dipilah: Scale,
  diangkut: Navigation,
  diolah: Recycle,
  produk: Sparkles,
};

export default async function PerjalananPage() {
  const session = await getSession();
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session!.user.id },
    select: { id: true },
  });

  if (!profile) {
    return (
      <div className="p-4">
        <EmptyState icon={Route} title="Profil belum aktif" hint="Hubungi admin untuk mengaktifkan akunmu." />
      </div>
    );
  }

  const j = await getWasteJourney(profile.id);
  const agg = await prisma.wasteRecord.aggregate({
    _sum: { totalGrams: true, co2ReducedKg: true },
    where: { userId: profile.id },
  });
  const totalKg = (agg._sum.totalGrams ?? 0) / 1000;
  const co2 = agg._sum.co2ReducedKg ?? 0;

  return (
    <div className="bg-brand-tint">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-brand-dark/5 bg-white/90 px-4 py-3 backdrop-blur-lg">
        <Link href="/beranda" className="press grid h-9 w-9 place-items-center rounded-full bg-brand-tint">
          <ChevronLeft size={20} className="text-brand-dark" />
        </Link>
        <div>
          <h1 className="text-base font-bold leading-tight text-brand-dark">Perjalanan Sampah</h1>
          <p className="text-xs text-gray-500">Ke mana sampahmu pergi & jadi apa</p>
        </div>
      </header>

      <div className="space-y-4 p-4">
        {/* ===== STATUS TERKINI ===== */}
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-brand-dark via-brand-600 to-brand p-5 text-white [box-shadow:var(--shadow-soft)]">
          <Recycle className="pointer-events-none absolute -right-4 -top-5 text-white/10" size={104} strokeWidth={1.2} />
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand-lime">Status terkini</p>
          <p className="mt-1.5 max-w-[20rem] text-lg font-bold leading-snug">{j.summary}</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Package size={15} className="text-white/70" />
              <span className="text-sm font-semibold">{totalKg.toFixed(0)} kg</span>
              <span className="text-xs text-white/60">terkelola</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cloud size={15} className="text-white/70" />
              <span className="text-sm font-semibold">{co2.toFixed(0)} kg</span>
              <span className="text-xs text-white/60">CO₂</span>
            </div>
          </div>
        </div>

        {/* ===== TIMELINE ===== */}
        <Card className="p-4">
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-brand-dark">Tahapan</h2>
          <ol className="relative">
            {j.stages.map((s, i) => {
              const Icon = STAGE_ICON[s.key];
              const isLast = i === j.stages.length - 1;
              const state = s.done ? "done" : s.active ? "active" : "todo";
              return (
                <li key={s.key} className="relative flex gap-3.5 pb-5 last:pb-0">
                  {/* garis vertikal */}
                  {!isLast && (
                    <span className={`absolute left-[19px] top-10 bottom-0 w-0.5 ${s.done ? "bg-brand-600" : "bg-gray-200"}`} />
                  )}
                  {/* node */}
                  <span
                    className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                      state === "done"
                        ? "bg-brand-600 text-white"
                        : state === "active"
                          ? "bg-brand-dark text-white ring-4 ring-brand-dark/10"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {state === "done" ? <Check size={18} strokeWidth={3} /> : <Icon size={18} strokeWidth={2} />}
                  </span>
                  {/* konten */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className={`text-sm font-bold ${state === "todo" ? "text-gray-400" : "text-brand-dark"}`}>{s.label}</p>
                      {state === "active" && (
                        <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold text-brand-600">proses</span>
                      )}
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          s.scope === "personal" ? "bg-lime-100 text-lime-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {s.scope === "personal" ? "Sampahmu" : "Komunitas"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{s.desc}</p>
                    {(s.meta || s.at) && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
                        {s.meta && <span className="flex items-center gap-1 font-medium text-brand-600"><MapPin size={11} /> {s.meta}</span>}
                        {s.at && <span>{tanggalJam(s.at)}</span>}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        {/* ===== CATATAN ===== */}
        <div className="flex items-start gap-2.5 rounded-2xl bg-white/70 p-3.5 ring-1 ring-brand-dark/5">
          <Info size={15} className="mt-0.5 shrink-0 text-brand-600" />
          <p className="text-xs leading-relaxed text-gray-500">
            Tahap <span className="font-medium text-brand-dark">Dijemput</span> &amp; <span className="font-medium text-brand-dark">Dipilah</span> mengikuti setoranmu sendiri.
            Setelah itu sampah melebur ke arus RT/komunitas, jadi tahap <span className="font-medium text-brand-dark">Diangkut</span>–<span className="font-medium text-brand-dark">Produk baru</span> mencerminkan progres hilir bulan ini.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/pickup" className="press flex items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3 text-sm font-semibold text-white">
            <Truck size={16} /> Lacak Pickup
          </Link>
          <Link href="/komunitas" className="press flex items-center justify-center gap-1.5 rounded-xl border border-brand-dark/10 bg-white py-3 text-sm font-semibold text-brand-dark">
            <Recycle size={16} /> Dampak Komunitas
          </Link>
        </div>
      </div>
    </div>
  );
}
