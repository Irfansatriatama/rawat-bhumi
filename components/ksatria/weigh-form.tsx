"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Inbox } from "lucide-react";
import { Card, EmptyState } from "@/components/ui/primitives";
import { Spinner } from "@/components/ui/loading";

type Opt = { id: string; label: string };

export function KsatriaWeighForm({ requestOptions }: { requestOptions: Opt[] }) {
  const router = useRouter();
  const [f, setF] = useState({ pickupRequestId: "", organik: "", anorganik: "", residu: "", b3: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const up = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  const input = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand";
  const label = "mb-1 block text-sm font-medium text-gray-700";

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
    return (
      <EmptyState
        icon={Inbox}
        title="Tidak ada KK untuk ditimbang"
        hint="Belum ada KK yang siap ditimbang saat ini. Cek kembali setelah ada konfirmasi warga."
      />
    );
  }

  return (
    <Card className="p-4">
      <form onSubmit={submit} className="space-y-4">
        {msg && (
          <p
            className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${
              msg.ok ? "bg-brand-soft text-brand-dark" : "bg-red-50 text-brand-red"
            }`}
          >
            {msg.ok ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
            )}
            <span>{msg.text}</span>
          </p>
        )}

        <div>
          <label className={label}>Pilih KK</label>
          <select className={input} value={f.pickupRequestId} onChange={(e) => up("pickupRequestId", e.target.value)} required>
            <option value="">— Pilih KK —</option>
            {requestOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Organik (g)</label>
            <input className={input} type="number" min={0} placeholder="0" value={f.organik} onChange={(e) => up("organik", e.target.value)} />
          </div>
          <div>
            <label className={label}>Anorganik (g)</label>
            <input className={input} type="number" min={0} placeholder="0" value={f.anorganik} onChange={(e) => up("anorganik", e.target.value)} />
          </div>
          <div>
            <label className={label}>Residu (g)</label>
            <input className={input} type="number" min={0} placeholder="0" value={f.residu} onChange={(e) => up("residu", e.target.value)} />
          </div>
          <div>
            <label className={label}>B3 (g)</label>
            <input className={input} type="number" min={0} placeholder="0" value={f.b3} onChange={(e) => up("b3", e.target.value)} />
          </div>
        </div>

        <button
          disabled={loading}
          className="press flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading && <Spinner size={16} />}
          {loading ? "Menyimpan…" : "Simpan timbangan"}
        </button>
      </form>
    </Card>
  );
}
