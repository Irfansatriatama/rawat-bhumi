"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Check } from "lucide-react";
import { Spinner } from "@/components/ui/loading";

/**
 * Dua tombol di dalam hero "Pickup Berikutnya":
 * - Lacak Pickup  → halaman live tracking kurir
 * - Ubah / Konfirmasi → POST konfirmasi kehadiran (reuse /api/pickup-requests)
 */
export function PickupHeroActions({
  scheduleId,
  confirmed,
}: {
  scheduleId?: string;
  confirmed: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(confirmed);

  async function confirm() {
    if (!scheduleId || done) return;
    setLoading(true);
    const res = await fetch("/api/pickup-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleId }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
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
        onClick={confirm}
        disabled={loading || !scheduleId}
        className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-[15px] font-semibold text-brand-dark disabled:opacity-70"
      >
        {loading ? (
          <Spinner size={17} />
        ) : done ? (
          <Check size={17} strokeWidth={2.6} className="text-brand-600" />
        ) : null}
        {done ? "Kehadiran Terkonfirmasi" : "Ubah / Konfirmasi"}
      </button>
    </div>
  );
}
