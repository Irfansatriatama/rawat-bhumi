"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateInvoicesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      <button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          const res = await fetch("/api/subscriptions/generate", { method: "POST" });
          const d = await res.json();
          setLoading(false);
          setMsg(res.ok ? `${d.created} tagihan dibuat (${d.period})` : d.error ?? "Gagal");
          router.refresh();
        }}
        className="rounded-lg bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "…" : "Generate Tagihan Bulan Ini"}
      </button>
      {msg && <span className="text-sm text-gray-500">{msg}</span>}
    </div>
  );
}

export function VerifyPaymentButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch(`/api/payments/${paymentId}`, { method: "PATCH" });
        setLoading(false);
        router.refresh();
      }}
      className="rounded bg-brand px-2 py-1 text-xs font-medium text-brand-dark disabled:opacity-60"
    >
      {loading ? "…" : "Verifikasi"}
    </button>
  );
}
