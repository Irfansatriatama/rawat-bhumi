"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Phone, Navigation, Scale, Truck, MapPinCheck,
  CircleCheck, BadgeCheck, AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { tanggal } from "@/lib/format";
import { Card } from "@/components/ui/primitives";
import { Spinner } from "@/components/ui/loading";

export type Stop = {
  id: string;
  name: string;
  phone: string | null;
  address: string;
  rt: string;
  date: Date | string;
  status: string;
};

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

export function RouteStopCard({ stop, index }: { stop: Stop; index: number }) {
  const router = useRouter();
  const [status, setStatus] = useState(stop.status);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const active = STATUS_INDEX[status] ?? 0;

  async function patch(next: string) {
    setLoading(true);
    setErr(null);
    const res = await fetch(`/api/pickup-requests/${stop.id}`, {
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

  // Aksi utama bergantung status saat ini.
  const action =
    active === 0
      ? { label: "Mulai Perjalanan", icon: Truck, onClick: () => patch("ON_THE_WAY") }
      : active === 1
        ? { label: "Tiba di Lokasi", icon: MapPinCheck, onClick: () => patch("ARRIVED") }
        : active === 2
          ? { label: "Timbang Sampah", icon: Scale, onClick: () => router.push("/ksatria/timbang") }
          : null;

  return (
    <Card className="p-3.5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-dark text-sm font-bold text-white">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-dark">{stop.name}</p>
          <p className="mt-0.5 text-xs text-gray-500">RT {stop.rt} · {tanggal(stop.date)}</p>
          <p className="mt-1 flex items-start gap-1 text-xs text-gray-400">
            <MapPin size={12} className="mt-0.5 shrink-0" /> {stop.address}
          </p>
        </div>
      </div>

      {/* Stepper status */}
      <div className="mt-3 flex items-start">
        {STEPS.map((s, i) => {
          const done = i < active;
          const now = i === active;
          const reached = done || now;
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-1 items-start">
              <div className="flex w-0 flex-1 flex-col items-center text-center">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full ${
                    reached ? "bg-brand-600 text-white" : "bg-brand-soft text-brand-600/40"
                  } ${now ? "ring-4 ring-brand-soft" : ""}`}
                >
                  <Icon size={15} strokeWidth={2.3} />
                </span>
                <span className={`mt-1.5 text-[10px] font-medium leading-tight ${reached ? "text-brand-dark" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className={`mt-4 h-[3px] w-full -translate-x-1 rounded-full ${done ? "bg-brand-600" : "bg-brand-soft"}`} />
              )}
            </div>
          );
        })}
      </div>

      {err && (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-red-50 px-2.5 py-2 text-[11px] text-brand-red">
          <AlertCircle size={13} className="mt-0.5 shrink-0" /> {err}
        </p>
      )}

      {/* Aksi */}
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-brand-dark/5 pt-3">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="press flex items-center justify-center gap-1 rounded-lg bg-brand-tint py-2 text-xs font-medium text-brand-dark"
        >
          <Navigation size={13} /> Peta
        </a>
        {stop.phone ? (
          <a
            href={`tel:${stop.phone}`}
            className="press flex items-center justify-center gap-1 rounded-lg bg-brand-tint py-2 text-xs font-medium text-brand-dark"
          >
            <Phone size={13} /> Telepon
          </a>
        ) : (
          <span className="flex items-center justify-center gap-1 rounded-lg bg-brand-tint/60 py-2 text-xs font-medium text-gray-400">
            <Phone size={13} /> —
          </span>
        )}
        {action ? (
          <button
            onClick={action.onClick}
            disabled={loading}
            className="press flex items-center justify-center gap-1 rounded-lg bg-brand-dark py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {loading ? <Spinner size={13} /> : <action.icon size={13} />} {action.label}
          </button>
        ) : (
          <span className="flex items-center justify-center gap-1 rounded-lg bg-brand-soft py-2 text-xs font-semibold text-brand-600">
            <CircleCheck size={13} /> Selesai
          </span>
        )}
      </div>
    </Card>
  );
}
