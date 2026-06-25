import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { prisma } from "@/lib/db";
import { AppHeader } from "@/components/ui/app-header";
import { BELAJAR_CATEGORIES, type Tone } from "@/lib/belajar";
import { MateriRow, type MateriLite } from "@/components/belajar/belajar-bits";

const TONE_CHIP: Record<Tone, string> = {
  green: "bg-brand-soft text-brand-600",
  teal: "bg-brand-dark/10 text-brand-dark",
  amber: "bg-amber-100 text-amber-600",
  lime: "bg-lime-100 text-lime-700",
  red: "bg-red-100 text-brand-red",
  slate: "bg-slate-100 text-slate-600",
};

export default async function KategoriIndexPage() {
  const contents = (await prisma.educationContent.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 100,
  })) as MateriLite[];

  const countByCat = contents.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <AppHeader title="Kategori Belajar" subtitle="Jelajahi materi berdasarkan topik" icon={LayoutGrid} />

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          {BELAJAR_CATEGORIES.map((c) => {
            const Icon = c.icon;
            const total = c.cats.reduce((s, k) => s + (countByCat[k] ?? 0), 0);
            return (
              <Link key={c.key} href={`/belajar/kategori/${c.key}`} className="press block">
                <div className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl ${TONE_CHIP[c.tone]}`}>
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-bold leading-snug text-brand-dark">{c.label}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">{total} materi</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-bold tracking-tight text-brand-dark">Semua Materi</h2>
            <span className="text-xs text-gray-400">{contents.length} materi</span>
          </div>
          <div className="space-y-3">
            {contents.map((m) => (
              <MateriRow key={m.slug} m={m} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
