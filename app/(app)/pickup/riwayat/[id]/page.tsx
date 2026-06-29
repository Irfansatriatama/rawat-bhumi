import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Sprout, Recycle, Trash2, TriangleAlert, Scale, Coins, Cloud,
  CheckCircle2, BookOpen, ClipboardCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { tanggal } from "@/lib/format";
import { readinessLevel } from "@/lib/business-rules";
import { Card } from "@/components/ui/primitives";

function gr(g: number): string {
  return g >= 1000 ? `${(g / 1000).toFixed(1)} kg` : `${g} g`;
}

export default async function HasilTimbanganPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionLike();
  const rec = session?.profileId
    ? await prisma.wasteRecord.findFirst({
        where: { id, userId: session.profileId },
        include: { pickupRequest: { select: { readinessScore: true } } },
      })
    : null;
  if (!rec) notFound();

  const cats: { icon: LucideIcon; label: string; g: number; href: string; color: string }[] = [
    { icon: Sprout, label: "Organik", g: rec.organikGrams, href: "/belajar/kategori/organik", color: "text-brand-600" },
    { icon: Recycle, label: "Anorganik", g: rec.anorganikGrams, href: "/belajar/kategori/anorganik", color: "text-sky-600" },
    { icon: Trash2, label: "Residu", g: rec.residuGrams, href: "/belajar/kategori/residu", color: "text-slate-500" },
    { icon: TriangleAlert, label: "B3", g: rec.b3Grams, href: "/belajar/kategori/b3", color: "text-brand-amber" },
  ];

  const score = rec.pickupRequest?.readinessScore ?? null;
  const level = score !== null ? readinessLevel(score) : null;
  const layak = level === "SIAP";
  // Kategori "kurang" (gram kecil → kemungkinan belum dipilah optimal) untuk nudge edukasi.
  const weak = cats.filter((c) => c.g === 0).slice(0, 2);

  return (
    <div className="min-h-[100dvh] bg-brand-tint pb-8">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-brand-dark/5 bg-white/90 px-4 py-3.5 backdrop-blur-lg">
        <Link href="/pickup/riwayat" className="press grid h-9 w-9 place-items-center rounded-full bg-brand-tint">
          <ArrowLeft size={18} className="text-brand-dark" />
        </Link>
        <h1 className="text-base font-bold text-brand-dark">Hasil Timbangan</h1>
      </header>

      <div className="space-y-3.5 p-4">
        {/* ===== Banner kelayakan (Learning Loop) ===== */}
        {level && (
          <div className={`overflow-hidden rounded-[var(--radius-card)] p-5 text-white [box-shadow:var(--shadow-soft)] ${layak ? "bg-gradient-to-br from-brand-600 to-brand-dark" : "bg-gradient-to-br from-amber-500 to-brand-amber"}`}>
            <div className="flex items-center gap-2">
              {layak ? <CheckCircle2 size={22} /> : <BookOpen size={22} />}
              <p className="text-sm font-bold uppercase tracking-wide">{layak ? "Pickup Layak ✅" : "Bisa lebih baik"}</p>
            </div>
            <h2 className="mt-2 text-3xl font-bold">{score}% <span className="text-base font-medium opacity-80">kesiapan</span></h2>
            <p className="mt-1 text-sm text-white/85">
              {layak
                ? "Pemilahanmu rapi — poin penuh masuk. Pertahankan, ya!"
                : "Pickup tetap jalan & poin diterima. Tingkatkan pemilahan untuk skor & poin maksimal."}
            </p>
          </div>
        )}

        <p className="px-1 text-sm font-semibold text-brand-dark">{tanggal(rec.recordedAt)}</p>

        {/* ===== Ringkasan ===== */}
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={Scale} value={(rec.totalGrams / 1000).toFixed(1)} unit="kg" label="Total" />
          <Stat icon={Coins} value={`+${rec.pointsEarned}`} unit="" label="Poin" />
          <Stat icon={Cloud} value={rec.co2ReducedKg.toFixed(1)} unit="kg" label="CO₂" />
        </div>

        {/* ===== Berat per kategori ===== */}
        <Card className="p-4">
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-brand-dark">Berat per Kategori</h3>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {cats.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="flex flex-col items-center text-center">
                  <Icon size={22} className={c.color} />
                  <p className="mt-1.5 text-sm font-bold text-brand-dark">{gr(c.g)}</p>
                  <p className="text-[10px] text-gray-400">{c.label}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ===== Edukasi (Learning Loop) bila perlu ===== */}
        {!layak && weak.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-brand-amber" />
              <h3 className="text-sm font-bold text-brand-dark">Tips agar skor naik</h3>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Beberapa kategori belum tercatat. Pelajari cara memilahnya agar pickup berikutnya lebih lengkap.
            </p>
            <div className="mt-3 space-y-2">
              {weak.map((c) => (
                <Link key={c.label} href={c.href} className="press flex items-center gap-2 rounded-xl bg-brand-tint px-3 py-2.5">
                  <ClipboardCheck size={15} className="text-brand-600" />
                  <span className="flex-1 text-sm font-medium text-brand-dark">Panduan memilah {c.label}</span>
                  <span className="text-xs text-brand-600">Buka</span>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, unit, label }: { icon: LucideIcon; value: string; unit: string; label: string }) {
  return (
    <Card className="flex flex-col items-center gap-1 p-3">
      <Icon size={20} className="text-brand-600" />
      <p className="text-lg font-bold leading-none text-brand-dark">{value}<span className="text-[10px] font-medium text-gray-400">{unit}</span></p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </Card>
  );
}
