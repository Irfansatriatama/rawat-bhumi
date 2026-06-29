"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, ClipboardCheck } from "lucide-react";
import { readinessLabel, type ReadinessFlags } from "@/lib/business-rules";
import { PickupReadinessSheet } from "./pickup-readiness-sheet";

/**
 * Aksi di dalam hero "Pickup Berikutnya":
 * - Lacak Pickup → halaman status pickup
 * - Saya Siap Pickup → buka Cek Kesiapan Sampah (skor) → konfirmasi kehadiran
 *   (POST /api/pickup-requests dengan readiness).
 */
export function PickupHeroActions({
  scheduleId,
  confirmed,
  initialFlags,
  readinessScore,
}: {
  scheduleId?: string;
  confirmed: boolean;
  initialFlags: ReadinessFlags;
  readinessScore: number | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(confirmed);
  const [score, setScore] = useState<number | null>(readinessScore);
  const [sheetOpen, setSheetOpen] = useState(false);

  async function confirm(flags: ReadinessFlags, newScore: number) {
    if (!scheduleId) return;
    setLoading(true);
    const res = await fetch("/api/pickup-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleId, readiness: flags }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setScore(newScore);
      setSheetOpen(false);
      router.refresh();
    }
  }

  return (
    <div className="mt-5 space-y-2.5">
      <Link
        href="/pickup/tracking"
        className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-deep/70 py-3.5 text-[15px] font-semibold text-white ring-1 ring-white/15 backdrop-blur"
      >
        Lacak Pickup
        <ChevronRight size={18} strokeWidth={2.4} className="ml-auto" />
      </Link>

      <button
        onClick={() => setSheetOpen(true)}
        disabled={!scheduleId}
        className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-[15px] font-semibold text-brand-dark disabled:opacity-70"
      >
        {done ? <Check size={17} strokeWidth={2.6} className="text-brand-600" /> : <ClipboardCheck size={17} />}
        {done ? "Kehadiran Terkonfirmasi" : "Saya Siap Pickup"}
      </button>

      {done && score !== null && (
        <p className="text-center text-xs text-white/80">
          Skor kesiapan: <span className="font-semibold text-brand-lime">{score}% · {readinessLabel(score)}</span> ·{" "}
          <button onClick={() => setSheetOpen(true)} className="underline underline-offset-2">Ubah</button>
        </p>
      )}

      <PickupReadinessSheet
        open={sheetOpen}
        initial={score !== null ? { ...initialFlags } : initialFlags}
        loading={loading}
        onClose={() => setSheetOpen(false)}
        onConfirm={confirm}
      />
    </div>
  );
}
