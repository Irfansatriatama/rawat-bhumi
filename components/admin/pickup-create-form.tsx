"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { TIME_SLOTS } from "@/lib/format";
import { Card, IconChip } from "@/components/ui/primitives";
import { Button } from "@/components/ui/loading";

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
    <Card className="p-5">
      <form onSubmit={submit}>
      <div className="mb-4 flex items-center gap-3">
        <IconChip icon={CalendarPlus} tone="teal" size={36} />
        <h2 className="font-semibold text-brand-dark">Buat Jadwal Pickup</h2>
      </div>
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
        <Button type="submit" loading={loading}>
          Buat
        </Button>
      </div>
      </form>
    </Card>
  );
}
