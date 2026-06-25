import Link from "next/link";
import { Route, Check, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { AppHeader } from "@/components/ui/app-header";
import { LEARNING_PATH, deriveProgress } from "@/lib/belajar";

export default async function JalurPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const [profile, totalContents] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId }, select: { totalPoints: true } }),
    prisma.educationContent.count({ where: { isPublished: true } }),
  ]);
  const { pathDone, pathPct } = deriveProgress(profile?.totalPoints ?? 0, totalContents);

  return (
    <div>
      <AppHeader title="Jalur Belajar" subtitle="Langkah demi langkah untuk pemula" icon={Route} />

      <div className="space-y-5 p-5">
        {/* ringkasan progres */}
        <div className="rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-brand-dark">Progres Kamu</p>
            <span className="text-sm font-bold text-brand-600">{pathPct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-tint">
            <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark" style={{ width: `${Math.max(4, pathPct)}%` }} />
          </div>
          <p className="mt-2 text-xs text-gray-500">{pathDone} dari {LEARNING_PATH.length} tahap selesai</p>
        </div>

        {/* timeline tahap */}
        <div className="relative space-y-3">
          {LEARNING_PATH.map((s, i) => {
            const done = i < pathDone;
            const active = i === pathDone;
            const Icon = s.icon;
            return (
              <Link key={s.no} href={`/belajar/kategori/${s.categoryKey}`} className="press block">
                <div
                  className={`flex items-center gap-3.5 rounded-[var(--radius-card)] bg-white p-4 ring-1 [box-shadow:var(--shadow-soft)] ${
                    active ? "ring-brand-600/30" : "ring-brand-dark/5"
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                      done ? "bg-brand-600 text-white" : active ? "bg-brand-soft text-brand-600" : "bg-brand-tint text-gray-400"
                    }`}
                  >
                    {done ? <Check size={20} strokeWidth={3} /> : <Icon size={20} strokeWidth={2} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-brand-dark">{s.no}. {s.label}</p>
                      {done && <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold text-brand-600">Selesai</span>}
                      {active && <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">Lanjut</span>}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{s.desc}</p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-gray-300" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
