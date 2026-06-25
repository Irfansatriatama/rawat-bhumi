"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CalendarCheck, Loader2 } from "lucide-react";

export function PickupConfirmButton({ scheduleId, confirmed }: { scheduleId: string; confirmed: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(confirmed);

  if (done)
    return (
      <span className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-soft py-2 text-xs font-semibold text-brand-600">
        <Check size={15} strokeWidth={2.5} /> Kehadiran terkonfirmasi
      </span>
    );

  return (
    <button
      disabled={loading}
      onClick={async () => {
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
      }}
      className="press flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-2.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <CalendarCheck size={15} strokeWidth={2.2} />
      )}
      {loading ? "Memproses…" : "Konfirmasi hadir"}
    </button>
  );
}
