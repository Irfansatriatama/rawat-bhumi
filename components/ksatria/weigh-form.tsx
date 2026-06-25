"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Opt = { id: string; label: string };

export function KsatriaWeighForm({ requestOptions }: { requestOptions: Opt[] }) {
  const router = useRouter();
  const [f, setF] = useState({ pickupRequestId: "", organik: "", anorganik: "", residu: "", b3: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const up = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  const input = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    // ksatriaProfileId diturunkan dari session di server.
    const res = await fetch("/api/waste-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickupRequestId: f.pickupRequestId,
        organikGrams: f.organik,
        anorganikGrams: f.anorganik,
        residuGrams: f.residu,
        b3Grams: f.b3,
      }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg({ ok: false, text: d.error ?? "Gagal" });
    setMsg({ ok: true, text: `Tersimpan: ${(d.totalGrams / 1000).toFixed(2)} kg, +${d.pointsEarned} poin warga` });
    setF({ pickupRequestId: "", organik: "", anorganik: "", residu: "", b3: "" });
    router.refresh();
  }

  if (requestOptions.length === 0) {
    return <p className="rounded-2xl bg-brand-bg p-4 text-sm text-gray-500">Tidak ada KK untuk ditimbang saat ini.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-black/5">
      {msg && (
        <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-brand-dark" : "bg-red-50 text-brand-red"}`}>
          {msg.text}
        </p>
      )}
      <select className={input} value={f.pickupRequestId} onChange={(e) => up("pickupRequestId", e.target.value)} required>
        <option value="">— Pilih KK —</option>
        {requestOptions.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input className={input} type="number" min={0} placeholder="Organik (g)" value={f.organik} onChange={(e) => up("organik", e.target.value)} />
        <input className={input} type="number" min={0} placeholder="Anorganik (g)" value={f.anorganik} onChange={(e) => up("anorganik", e.target.value)} />
        <input className={input} type="number" min={0} placeholder="Residu (g)" value={f.residu} onChange={(e) => up("residu", e.target.value)} />
        <input className={input} type="number" min={0} placeholder="B3 (g)" value={f.b3} onChange={(e) => up("b3", e.target.value)} />
      </div>
      <button disabled={loading} className="w-full rounded-lg bg-brand-dark py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
        {loading ? "Menyimpan…" : "Simpan timbangan"}
      </button>
    </form>
  );
}
