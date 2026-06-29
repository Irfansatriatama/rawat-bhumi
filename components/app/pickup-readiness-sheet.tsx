"use client";

import { useMemo, useState } from "react";
import { Leaf, Recycle, Trash2, TriangleAlert, X, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { calcReadinessScore, readinessLevel, type ReadinessFlags } from "@/lib/business-rules";
import { Spinner } from "@/components/ui/loading";

const CATS: { key: keyof ReadinessFlags; label: string; icon: LucideIcon; hint: string; href: string }[] = [
  { key: "organik", label: "Organik", icon: Leaf, hint: "Sisa makanan, sayur, daun", href: "/belajar/kategori/organik" },
  { key: "anorganik", label: "Anorganik", icon: Recycle, hint: "Plastik, kaca, logam — bersih & kering", href: "/belajar/kategori/anorganik" },
  { key: "residu", label: "Residu", icon: Trash2, hint: "Popok, tisu kotor, styrofoam", href: "/belajar/kategori/residu" },
  { key: "b3", label: "B3 & E-Waste", icon: TriangleAlert, hint: "Baterai, lampu, elektronik", href: "/belajar/kategori/b3" },
];

const LEVEL_STYLE = {
  SIAP: { ring: "ring-brand-600", bar: "bg-brand-600", text: "text-brand-600", chip: "bg-brand-soft text-brand-600" },
  CUKUP: { ring: "ring-amber-400", bar: "bg-amber-400", text: "text-brand-amber", chip: "bg-amber-100 text-brand-amber" },
  BELAJAR: { ring: "ring-rose-300", bar: "bg-rose-400", text: "text-rose-600", chip: "bg-rose-100 text-rose-600" },
} as const;

const LEVEL_LABEL = { SIAP: "Siap pickup", CUKUP: "Cukup", BELAJAR: "Perlu belajar" } as const;

/**
 * Bottom-sheet "Cek Kesiapan Sampah" (self-assessment, fondasi WSSPR).
 * Warga tandai 4 kategori Belum/Sudah → skor otomatis → konfirmasi.
 * Pickup tak pernah ditolak; skor < 75 menampilkan nudge edukasi.
 */
export function PickupReadinessSheet({
  open,
  initial,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  initial: ReadinessFlags;
  loading: boolean;
  onClose: () => void;
  onConfirm: (flags: ReadinessFlags, score: number) => void;
}) {
  const [flags, setFlags] = useState<ReadinessFlags>(initial);
  const score = useMemo(() => calcReadinessScore(flags), [flags]);
  const level = readinessLevel(score);
  const st = LEVEL_STYLE[level];

  if (!open) return null;

  const weakCats = CATS.filter((c) => !flags[c.key]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="relative w-full max-w-md rounded-t-[28px] bg-white p-5 pb-7 [animation:fade_.25s_ease]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200" />
        <button onClick={onClose} className="press absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-brand-tint text-gray-500">
          <X size={16} />
        </button>

        <h3 className="text-lg font-bold text-brand-dark">Cek Kesiapan Sampah</h3>
        <p className="mt-0.5 text-sm text-gray-500">Tandai yang sudah kamu pilah. Pickup tetap jalan walau belum lengkap.</p>

        {/* Skor */}
        <div className="mt-4 flex items-center gap-4 rounded-2xl bg-brand-tint p-4">
          <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white ring-4 ${st.ring}`}>
            <span className={`text-xl font-bold ${st.text}`}>{score}%</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className={`inline-block rounded-lg px-2 py-0.5 text-[11px] font-bold ${st.chip}`}>{LEVEL_LABEL[level]}</span>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
              <div className={`h-full rounded-full ${st.bar} transition-all`} style={{ width: `${Math.max(4, score)}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-gray-500">Standar siap: ≥75% (3 dari 4 kategori)</p>
          </div>
        </div>

        {/* Checklist */}
        <div className="mt-4 space-y-2">
          {CATS.map((c) => {
            const Icon = c.icon;
            const on = flags[c.key];
            return (
              <div key={c.key} className="flex items-center gap-3 rounded-2xl border border-brand-dark/5 p-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${on ? "bg-brand-soft text-brand-600" : "bg-gray-100 text-gray-400"}`}>
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-dark">{c.label}</p>
                  <p className="truncate text-[11px] text-gray-400">{c.hint}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {[false, true].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => setFlags((f) => ({ ...f, [c.key]: val }))}
                      className={`press rounded-full px-3 py-1.5 text-xs font-semibold ${
                        on === val
                          ? val
                            ? "bg-brand-600 text-white"
                            : "bg-gray-200 text-gray-600"
                          : "bg-brand-tint text-gray-400"
                      }`}
                    >
                      {val ? "Sudah" : "Belum"}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Nudge edukasi bila < siap */}
        {level !== "SIAP" && weakCats.length > 0 && (
          <Link
            href={weakCats[0].href}
            className="press mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-amber-800"
          >
            <BookOpen size={15} className="shrink-0" />
            <span className="flex-1 text-xs font-medium">
              Belum yakin memilah {weakCats.map((c) => c.label).join(", ")}? Pelajari caranya.
            </span>
          </Link>
        )}

        <button
          onClick={() => onConfirm(flags, score)}
          disabled={loading}
          className="press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-dark py-3.5 text-[15px] font-semibold text-white disabled:opacity-70"
        >
          {loading ? <Spinner size={17} /> : null}
          Saya Siap Pickup
        </button>
      </div>
    </div>
  );
}
