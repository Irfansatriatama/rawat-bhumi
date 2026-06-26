"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Power } from "lucide-react";
import { Spinner } from "@/components/ui/loading";

/** Switch status bertugas Ksatria (online/libur). */
export function DutyToggle({ initial }: { initial: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !on;
    setLoading(true);
    setOn(next); // optimistik
    const res = await fetch("/api/ksatria/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOnDuty: next }),
    });
    setLoading(false);
    if (!res.ok) {
      setOn(!next); // rollback
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${on ? "bg-brand-soft" : "bg-slate-100"}`}>
        <Power size={20} className={on ? "text-brand-600" : "text-slate-400"} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-dark">Status Bertugas</p>
        <p className="text-xs text-gray-500">{on ? "Kamu sedang online & menerima tugas" : "Kamu sedang libur"}</p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        role="switch"
        aria-checked={on}
        aria-label="Status bertugas"
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${on ? "bg-brand-600" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-1 grid h-5 w-5 place-items-center rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`}
        >
          {loading && <Spinner size={11} />}
        </span>
      </button>
    </div>
  );
}
