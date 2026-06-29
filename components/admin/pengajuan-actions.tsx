"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Power } from "lucide-react";
import { Spinner } from "@/components/ui/loading";

export function JoinRequestActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject") {
    setLoading(action);
    const res = await fetch(`/api/join-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        onClick={() => act("reject")}
        disabled={!!loading}
        className="press grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-600 disabled:opacity-50"
        aria-label="Tolak"
      >
        {loading === "reject" ? <Spinner size={15} /> : <X size={17} />}
      </button>
      <button
        onClick={() => act("approve")}
        disabled={!!loading}
        className="press flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading === "approve" ? <Spinner size={15} /> : <Check size={16} />} Setujui
      </button>
    </div>
  );
}

export function AktivasiButton({ rtId }: { rtId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function activate() {
    if (!confirm("Aktifkan wilayah ini? Semua pelopor akan jadi anggota aktif.")) return;
    setLoading(true);
    const res = await fetch(`/api/rt/${rtId}/activate`, { method: "POST" });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={activate}
      disabled={loading}
      className="press flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-dark px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      {loading ? <Spinner size={15} /> : <Power size={15} />} Aktifkan
    </button>
  );
}
