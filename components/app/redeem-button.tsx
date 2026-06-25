"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RedeemButton({ rewardId, disabled }: { rewardId: string; disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={disabled || loading}
        onClick={async () => {
          setLoading(true);
          const res = await fetch("/api/rewards/redeem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rewardId }),
          });
          const d = await res.json();
          setLoading(false);
          setMsg(res.ok ? "Berhasil ditukar ✓" : d.error ?? "Gagal");
          if (res.ok) router.refresh();
        }}
        className="rounded bg-brand-dark px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
      >
        {loading ? "…" : "Tukar"}
      </button>
      {msg && <span className="text-xs text-gray-500">{msg}</span>}
    </div>
  );
}
