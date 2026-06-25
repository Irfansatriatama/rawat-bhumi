"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { currentPeriod } from "@/lib/format";

export function EsgGenerate() {
  const router = useRouter();
  const [period, setPeriod] = useState(currentPeriod());
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        placeholder="YYYY-MM"
      />
      <button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          const res = await fetch("/api/reports/esg", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ period }),
          });
          setLoading(false);
          setMsg(res.ok ? "Laporan dibuat." : "Gagal.");
          router.refresh();
        }}
        className="rounded-lg bg-brand-dark px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Membuat…" : "Generate Laporan ESG"}
      </button>
      {msg && <span className="text-sm text-gray-500">{msg}</span>}
    </div>
  );
}
