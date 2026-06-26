import Link from "next/link";
import { ChevronLeft, Sprout, Recycle, Trash2, TriangleAlert, Check, Flame, CalendarCheck, History } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getSessionLike } from "@/lib/session";
import { getActivityHistory, type SortCategoryKey } from "@/lib/activity";
import { WASTE_CATEGORY } from "@/lib/prisma-enums";
import { Card, StatCard, EmptyState } from "@/components/ui/primitives";

const ICONS: Record<string, LucideIcon> = {
  [WASTE_CATEGORY.ORGANIK]: Sprout,
  [WASTE_CATEGORY.ANORGANIK]: Recycle,
  [WASTE_CATEGORY.RESIDU]: Trash2,
  [WASTE_CATEGORY.B3]: TriangleAlert,
};

function labelTanggal(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" }).format(new Date(y, m - 1, d));
}

export default async function AktivitasPage() {
  const session = await getSessionLike();
  if (!session?.profileId) {
    return (
      <div className="p-4">
        <EmptyState icon={History} title="Profil belum aktif" hint="Hubungi admin untuk mengaktifkan akunmu." />
      </div>
    );
  }

  const history = await getActivityHistory(session.profileId, 30);
  const todayKey = history[0]?.date;

  // hari aktif (min 1 kategori) dalam 30 hari
  const activeDays = history.filter((h) => h.doneCount > 0).length;
  // streak berjalan: hari berturut dari hari ini yang ada aktivitas
  let streak = 0;
  for (const h of history) {
    if (h.doneCount > 0) streak++;
    else break;
  }

  const shown = history.filter((h) => h.doneCount > 0 || h.date === todayKey);

  return (
    <div className="bg-brand-tint">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-brand-dark/5 bg-white/90 px-4 py-3 backdrop-blur-lg">
        <Link href="/beranda" className="press grid h-9 w-9 place-items-center rounded-full bg-brand-tint">
          <ChevronLeft size={20} className="text-brand-dark" />
        </Link>
        <div>
          <h1 className="text-base font-bold leading-tight text-brand-dark">Aktivitas Pilah</h1>
          <p className="text-xs text-gray-500">Riwayat 30 hari terakhir</p>
        </div>
      </header>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Flame} tone="amber" value={streak} suffix="hari" label="Streak berjalan" />
          <StatCard icon={CalendarCheck} tone="green" value={activeDays} suffix="hari" label="Aktif (30 hari)" />
        </div>

        {shown.length === 0 ? (
          <EmptyState icon={History} title="Belum ada aktivitas" hint="Tandai kategori pilahanmu di beranda untuk mulai mencatat." />
        ) : (
          <div className="space-y-2.5">
            {shown.map((h) => (
              <Card key={h.date} className="p-3.5">
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-sm font-semibold text-brand-dark">
                    {h.date === todayKey ? "Hari ini" : labelTanggal(h.date)}
                  </p>
                  <span className="rounded-lg bg-brand-tint px-2 py-0.5 text-[11px] font-bold text-brand-600">
                    {h.doneCount}/4
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {h.states.map((s) => {
                    const Icon = ICONS[s.key as SortCategoryKey] ?? Sprout;
                    return (
                      <div key={s.key} className="flex flex-col items-center gap-1 text-center">
                        <span className={`relative grid h-10 w-10 place-items-center rounded-xl ${s.done ? "bg-brand-soft" : "bg-brand-tint"}`}>
                          <Icon size={18} strokeWidth={1.9} className={s.done ? "text-brand-600" : "text-gray-300"} />
                          {s.done && (
                            <span className="absolute -right-1 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-brand-600 text-white">
                              <Check size={8} strokeWidth={3.5} />
                            </span>
                          )}
                        </span>
                        <p className={`text-[10px] leading-tight ${s.done ? "font-medium text-brand-dark" : "text-gray-400"}`}>{s.label}</p>
                        {s.done && <p className="text-[9px] leading-none text-gray-400">{s.auto ? "pickup" : "manual"}</p>}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
