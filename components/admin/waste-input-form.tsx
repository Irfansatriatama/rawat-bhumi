"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, Inbox } from "lucide-react";
import { Card, IconChip, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/loading";

type Opt = { id: string; label: string };

export function WasteInputForm({ requestOptions, ksatriaOptions }: { requestOptions: Opt[]; ksatriaOptions: Opt[] }) {
  const router = useRouter();
  const [f, setF] = useState({ pickupRequestId: "", ksatriaProfileId: "", organik: "", anorganik: "", residu: "", b3: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const up = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  const input = "rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/waste-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickupRequestId: f.pickupRequestId,
        ksatriaProfileId: f.ksatriaProfileId,
        organikGrams: f.organik,
        anorganikGrams: f.anorganik,
        residuGrams: f.residu,
        b3Grams: f.b3,
      }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg({ ok: false, text: d.error ?? "Gagal" });
    setMsg({ ok: true, text: `Tersimpan: +${d.pointsEarned} poin, ${(d.totalGrams / 1000).toFixed(2)} kg` });
    setF({ pickupRequestId: "", ksatriaProfileId: "", organik: "", anorganik: "", residu: "", b3: "" });
    router.refresh();
  }

  if (requestOptions.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Belum ada pickup request untuk ditimbang"
        hint="Belum ada pickup request terkonfirmasi. Warga perlu konfirmasi hadir dulu, atau buat jadwal & request lebih dahulu."
      />
    );
  }

  return (
    <Card className="p-5">
      <form onSubmit={submit}>
      <div className="mb-4 flex items-center gap-3">
        <IconChip icon={Scale} tone="green" size={36} />
        <h2 className="font-semibold text-brand-dark">Input Timbangan (manual)</h2>
      </div>
      {msg && (
        <p className={`mb-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-brand-soft text-brand-600" : "bg-red-50 text-brand-red"}`}>
          {msg.text}
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select className={input} value={f.pickupRequestId} onChange={(e) => up("pickupRequestId", e.target.value)} required>
          <option value="">— Pilih pickup request —</option>
          {requestOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <select className={input} value={f.ksatriaProfileId} onChange={(e) => up("ksatriaProfileId", e.target.value)} required>
          <option value="">— Ksatria penimbang —</option>
          {ksatriaOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <input className={input} type="number" min={0} placeholder="Organik (gram)" value={f.organik} onChange={(e) => up("organik", e.target.value)} />
        <input className={input} type="number" min={0} placeholder="Anorganik (gram)" value={f.anorganik} onChange={(e) => up("anorganik", e.target.value)} />
        <input className={input} type="number" min={0} placeholder="Residu (gram)" value={f.residu} onChange={(e) => up("residu", e.target.value)} />
        <input className={input} type="number" min={0} placeholder="B3 (gram)" value={f.b3} onChange={(e) => up("b3", e.target.value)} />
      </div>
      <Button type="submit" loading={loading} className="mt-4">
        Simpan timbangan
      </Button>
      </form>
    </Card>
  );
}
