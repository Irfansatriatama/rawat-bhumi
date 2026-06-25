"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TIME_SLOTS } from "@/lib/format";

type Opt = { id: string; label: string };

export function PickupCreateForm({ rtOptions, ksatriaOptions }: { rtOptions: Opt[]; ksatriaOptions: Opt[] }) {
  const router = useRouter();
  const [rtId, setRtId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [ksatriaId, setKsatriaId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const input = "rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/pickups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rtId, scheduledDate: date, timeSlot, ksatriaId: ksatriaId || null }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(d.error ?? "Gagal");
    setDate("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-4 font-semibold text-brand-dark">Buat Jadwal Pickup</h2>
      {msg && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{msg}</p>}
      <div className="flex flex-wrap items-end gap-3">
        <select className={input} value={rtId} onChange={(e) => setRtId(e.target.value)} required>
          <option value="">— Pilih RT —</option>
          {rtOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <input className={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <select className={input} value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select className={input} value={ksatriaId} onChange={(e) => setKsatriaId(e.target.value)}>
          <option value="">— Ksatria (opsional) —</option>
          {ksatriaOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <button disabled={loading} className="rounded-lg bg-brand-dark px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
          {loading ? "…" : "Buat"}
        </button>
      </div>
    </form>
  );
}
