"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck, MapPinCheck, CircleCheck, BadgeCheck, Scale, AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { Spinner } from "@/components/ui/loading";

const STEPS: { icon: LucideIcon; label: string }[] = [
  { icon: BadgeCheck, label: "Siap" },
  { icon: Truck, label: "Perjalanan" },
  { icon: MapPinCheck, label: "Tiba" },
  { icon: CircleCheck, label: "Selesai" },
];

const STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 0,
  ON_THE_WAY: 1,
  ARRIVED: 2,
  COMPLETED: 3,
};

export function TaskWorkflow({
  requestId,
  initialStatus,
  completedKg,
  completedPoints,
}: {
  requestId: string;
  initialStatus: string;
  completedKg?: number;
  completedPoints?: number;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState({ organik: "", anorganik: "", residu: "", b3: "" });
  const [done, setDone] = useState<{ kg: number; points: number } | null>(
    completedKg != null ? { kg: completedKg, points: completedPoints ?? 0 } : null
  );

  const active = STATUS_INDEX[status] ?? 0;
  const up = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand";
  const labelCls = "mb-1 block text-xs font-medium text-gray-600";

  async function patch(next: string) {
    setLoading(true);
    setErr(null);
    const res = await fetch(`/api/pickup-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setErr(d.error ?? "Gagal memperbarui status");
    }
    setStatus(next);
    router.refresh();
  }

  async function submitWeigh(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/waste-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickupRequestId: requestId,
        organikGrams: f.organik,
        anorganikGrams: f.anorganik,
        residuGrams: f.residu,
        b3Grams: f.b3,
      }),
    });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setErr(d.error ?? "Gagal menyimpan timbangan");
    setStatus("COMPLETED");
    setDone({ kg: (d.totalGrams ?? 0) / 1000, points: d.pointsEarned ?? 0 });
    router.refresh();
  }

  return (
    <Card className="p-4">
      <h3 className="text-[12px] font-bold uppercase tracking-wide text-brand-dark">Status & Timbang</h3>

      {/* Stepper */}
      <div className="mt-4 flex items-start">
        {STEPS.map((s, i) => {
          const stepDone = i < active;
          const now = i === active;
          const reached = stepDone || now;
          const Icon = s.icon;
          return (
            <Fragment key={s.label}>
              <div className="flex w-0 flex-1 flex-col items-center text-center">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full ${
                    reached ? "bg-brand-600 text-white" : "bg-brand-soft text-brand-600/40"
                  } ${now ? "ring-4 ring-brand-soft" : ""}`}
                >
                  <Icon size={18} strokeWidth={2.3} />
                </span>
                <span className={`mt-1.5 text-[10px] font-medium leading-tight ${reached ? "text-brand-dark" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className={`mt-[18.5px] h-[3px] flex-1 rounded-full ${stepDone ? "bg-brand-600" : "bg-brand-soft"}`} />
              )}
            </Fragment>
          );
        })}
      </div>

      {err && (
        <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-brand-red">
          <AlertCircle size={14} className="mt-0.5 shrink-0" /> {err}
        </p>
      )}

      {/* Aksi sesuai status */}
      <div className="mt-4">
        {active === 0 && (
          <button onClick={() => patch("ON_THE_WAY")} disabled={loading} className={btnPrimary}>
            {loading ? <Spinner size={16} /> : <Truck size={16} />} Mulai Perjalanan
          </button>
        )}

        {active === 1 && (
          <button onClick={() => patch("ARRIVED")} disabled={loading} className={btnPrimary}>
            {loading ? <Spinner size={16} /> : <MapPinCheck size={16} />} Tiba di Lokasi
          </button>
        )}

        {active === 2 && (
          <form onSubmit={submitWeigh} className="space-y-3">
            <p className="text-xs text-gray-500">Catat berat sampah per kategori (gram), lalu selesaikan.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Organik (g)</label>
                <input className={inputCls} type="number" min={0} placeholder="0" value={f.organik} onChange={(e) => up("organik", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Anorganik (g)</label>
                <input className={inputCls} type="number" min={0} placeholder="0" value={f.anorganik} onChange={(e) => up("anorganik", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Residu (g)</label>
                <input className={inputCls} type="number" min={0} placeholder="0" value={f.residu} onChange={(e) => up("residu", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>B3 (g)</label>
                <input className={inputCls} type="number" min={0} placeholder="0" value={f.b3} onChange={(e) => up("b3", e.target.value)} />
              </div>
            </div>
            <button disabled={loading} className={btnPrimary}>
              {loading ? <Spinner size={16} /> : <Scale size={16} />} Simpan Timbangan & Selesai
            </button>
          </form>
        )}

        {active === 3 && (
          <div className="flex items-center gap-3 rounded-xl bg-brand-soft px-4 py-3.5">
            <CircleCheck size={22} className="shrink-0 text-brand-600" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-brand-dark">Penjemputan selesai 🎉</p>
              {done && (
                <p className="text-xs text-gray-600">
                  {done.kg.toFixed(2)} kg tercatat · +{done.points} poin warga
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

const btnPrimary =
  "press flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3.5 text-sm font-semibold text-white disabled:opacity-60";
