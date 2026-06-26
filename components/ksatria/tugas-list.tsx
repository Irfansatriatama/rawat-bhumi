"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, ChevronRight, ClipboardList } from "lucide-react";
import { tanggal } from "@/lib/format";
import { Card, EmptyState, StatusBadge } from "@/components/ui/primitives";

export type Task = {
  id: string;
  name: string;
  address: string;
  rt: string;
  date: Date | string;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  CONFIRMED: "Siap dijemput",
  ON_THE_WAY: "Dalam perjalanan",
  ARRIVED: "Tiba di lokasi",
};

export function TugasList({ tasks }: { tasks: Task[] }) {
  const rts = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.rt))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [tasks]
  );
  const [rt, setRt] = useState<string>("ALL");
  const filtered = rt === "ALL" ? tasks : tasks.filter((t) => t.rt === rt);

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Belum ada tugas"
        hint="Tugas muncul saat warga mengonfirmasi kehadiran pada jadwal penjemputanmu."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter per RT */}
      {rts.length > 1 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip active={rt === "ALL"} onClick={() => setRt("ALL")}>Semua</Chip>
          {rts.map((r) => (
            <Chip key={r} active={rt === r} onClick={() => setRt(r)}>RT {r}</Chip>
          ))}
        </div>
      )}

      <div className="space-y-2.5">
        {filtered.map((t, i) => (
          <Link key={t.id} href={`/ksatria/tugas/${t.id}`} className="press block">
            <Card className="p-3.5">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-dark text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-dark">{t.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">RT {t.rt} · {tanggal(t.date)}</p>
                  <p className="mt-1 flex items-start gap-1 text-xs text-gray-400">
                    <MapPin size={12} className="mt-0.5 shrink-0" /> {t.address}
                  </p>
                  <div className="mt-2">
                    <StatusBadge tone={t.status === "ON_THE_WAY" || t.status === "ARRIVED" ? "amber" : "green"}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </StatusBadge>
                  </div>
                </div>
                <ChevronRight size={18} className="mt-1 shrink-0 text-gray-300" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`press shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active ? "bg-brand-dark text-white" : "bg-white text-brand-dark ring-1 ring-brand-dark/10"
      }`}
    >
      {children}
    </button>
  );
}
