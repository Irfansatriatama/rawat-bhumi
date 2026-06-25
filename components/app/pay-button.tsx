"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/loading";

export function PayButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pay(method: "QRIS" | "CASH") {
    setLoading(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, method }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(d.error ?? "Gagal");
    setMsg(method === "QRIS" ? "Lunas via QRIS ✓" : "Tunai dicatat — menunggu verifikasi admin");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button disabled={loading} onClick={() => pay("QRIS")} className="inline-flex items-center justify-center gap-1.5 rounded bg-brand-dark px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60">
          {loading && <Spinner size={13} />}
          QRIS
        </button>
        <button disabled={loading} onClick={() => pay("CASH")} className="inline-flex items-center justify-center gap-1.5 rounded bg-brand px-3 py-1.5 text-xs font-medium text-brand-dark disabled:opacity-60">
          {loading && <Spinner size={13} />}
          Tunai
        </button>
      </div>
      {msg && <span className="text-xs text-gray-500">{msg}</span>}
    </div>
  );
}
