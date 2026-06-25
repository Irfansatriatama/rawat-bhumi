"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WASTE_CATEGORY, CATEGORY_TO_PARTNER } from "@/lib/prisma-enums";

type Partner = { id: string; name: string; type: string };

export function DeliveryCreateForm({ partners }: { partners: Partner[] }) {
  const router = useRouter();
  const [category, setCategory] = useState<string>(WASTE_CATEGORY.ORGANIK);
  const [partnerId, setPartnerId] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [date, setDate] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const input = "rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand";

  const validPartners = partners.filter((p) => p.type === CATEGORY_TO_PARTNER[category]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/hilir/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId, category, weightKg: Number(weightKg), deliveryDate: date }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg({ ok: false, text: d.error ?? "Gagal" });
    setMsg({ ok: true, text: "Distribusi tercatat." });
    setWeightKg("");
    setDate("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-4 font-semibold text-brand-dark">Catat Distribusi Hilir</h2>
      {msg && (
        <p className={`mb-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-brand-dark" : "bg-red-50 text-brand-red"}`}>
          {msg.text}
        </p>
      )}
      <div className="flex flex-wrap items-end gap-3">
        <select
          className={input}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPartnerId("");
          }}
        >
          {Object.values(WASTE_CATEGORY).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className={input} value={partnerId} onChange={(e) => setPartnerId(e.target.value)} required>
          <option value="">— Partner ({CATEGORY_TO_PARTNER[category]}) —</option>
          {validPartners.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input className={input} type="number" step="0.01" min={0} placeholder="Berat (kg)" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required />
        <input className={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <button disabled={loading} className="rounded-lg bg-brand-dark px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
          {loading ? "…" : "Catat"}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Routing divalidasi: B3 hanya ke pengelola B3, organik ke processor, dst.
      </p>
    </form>
  );
}
