"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Spinner } from "@/components/ui/loading";

export function GenerateInvoicesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      <Button
        loading={loading}
        onClick={async () => {
          setLoading(true);
          const res = await fetch("/api/subscriptions/generate", { method: "POST" });
          const d = await res.json();
          setLoading(false);
          setMsg(res.ok ? `${d.created} tagihan dibuat (${d.period})` : d.error ?? "Gagal");
          router.refresh();
        }}
      >
        Generate Tagihan Bulan Ini
      </Button>
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
      className="inline-flex items-center justify-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-medium text-brand-dark transition hover:opacity-90 disabled:opacity-60"
    >
      {loading && <Spinner size={12} />}
      Verifikasi
    </button>
  );
}
