"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Sprout, Recycle, Trash2, TriangleAlert, Check, ChevronRight, History } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { Spinner } from "@/components/ui/loading";
import { WASTE_CATEGORY } from "@/lib/prisma-enums";
import type { CategoryState } from "@/lib/activity";
import { toggleSortCategory } from "@/app/(app)/beranda/actions";

const ICONS: Record<string, LucideIcon> = {
  [WASTE_CATEGORY.ORGANIK]: Sprout,
  [WASTE_CATEGORY.ANORGANIK]: Recycle,
  [WASTE_CATEGORY.RESIDU]: Trash2,
  [WASTE_CATEGORY.B3]: TriangleAlert,
};

export function ActivityCard({ initial }: { initial: CategoryState[] }) {
  // state manual lokal (optimistik); auto bersifat tetap (dari pickup).
  const [manual, setManual] = useState<Record<string, boolean>>(
    () => Object.fromEntries(initial.map((c) => [c.key, c.manual])),
  );
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const autoOf = (key: string) => initial.find((c) => c.key === key)?.auto ?? false;
  const doneOf = (c: CategoryState) => autoOf(c.key) || manual[c.key];
  const doneCount = initial.filter(doneOf).length;
  const pct = Math.round((doneCount / initial.length) * 100);

  function toggle(key: string) {
    if (autoOf(key) || pendingKey) return; // auto dari pickup tak bisa dilepas
    const next = !manual[key];
    setManual((m) => ({ ...m, [key]: next })); // optimistik
    setPendingKey(key);
    startTransition(async () => {
      const res = await toggleSortCategory(key);
      if (!res.success) setManual((m) => ({ ...m, [key]: !next })); // revert bila gagal
      setPendingKey(null);
    });
  }

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-brand-dark">Aktivitas hari ini</h2>
        <Link href="/beranda/aktivitas" className="press flex items-center gap-0.5 text-xs font-medium text-brand-600">
          <History size={13} /> Riwayat
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-tint">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all" style={{ width: `${Math.max(4, pct)}%` }} />
        </div>
        <span className="shrink-0 text-xs font-semibold text-brand-600">{pct}% selesai</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {initial.map((c) => {
          const Icon = ICONS[c.key] ?? Sprout;
          const auto = autoOf(c.key);
          const done = doneOf(c);
          const loading = pendingKey === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => toggle(c.key)}
              disabled={auto || !!pendingKey}
              aria-pressed={done}
              className={`press flex flex-col items-center gap-1.5 rounded-2xl py-1 transition ${auto ? "cursor-default" : ""} disabled:opacity-100`}
            >
              <span className={`relative grid h-12 w-12 place-items-center rounded-2xl transition-colors ${done ? "bg-brand-soft" : "bg-brand-tint"}`}>
                <Icon size={22} strokeWidth={1.8} className={done ? "text-brand-600" : "text-gray-400"} />
                <span
                  className={`absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full ${
                    done ? "bg-brand-600 text-white" : "border-2 border-gray-200 bg-white"
                  }`}
                >
                  {loading ? <Spinner size={9} /> : done && <Check size={9} strokeWidth={3.5} />}
                </span>
              </span>
              <div>
                <p className="text-[11px] font-semibold leading-tight text-brand-dark">{c.label}</p>
                <p className="text-[10px] leading-tight text-gray-400">
                  {auto ? "dari pickup" : done ? "tercatat" : "tandai"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <Link
        href="/belajar"
        className="press mt-4 flex items-center justify-between rounded-xl border border-brand-dark/8 px-3.5 py-2.5 text-sm font-medium text-brand-dark"
      >
        Lihat panduan pemilahan
        <ChevronRight size={16} className="text-gray-400" />
      </Link>
    </Card>
  );
}
