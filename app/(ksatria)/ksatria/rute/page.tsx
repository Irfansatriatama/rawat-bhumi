import Link from "next/link";
import { MapPin, Scale, Route, Phone, Navigation } from "lucide-react";
import { getKsatriaProfile, routeStopsForKsatria } from "@/lib/ksatria";
import { tanggal } from "@/lib/format";
import { Card, EmptyState, StatusBadge } from "@/components/ui/primitives";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  CONFIRMED: "Siap dijemput",
  ON_THE_WAY: "Dalam perjalanan",
  ARRIVED: "Tiba di lokasi",
};

export default async function RutePage() {
  const kp = await getKsatriaProfile();
  if (!kp) return <p className="text-sm text-gray-500">Bukan akun Ksatria.</p>;

  const stops = await routeStopsForKsatria(kp.id);

  return (
    <div className="space-y-5 p-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-brand-dark">Rute Pickup</h2>
          <p className="text-sm text-gray-500">Urutan KK yang siap dijemput hari ini.</p>
        </div>
        {stops.length > 0 && (
          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-600">{stops.length} titik</span>
        )}
      </div>

      {stops.length === 0 ? (
        <EmptyState
          icon={Route}
          title="Belum ada KK"
          hint="Belum ada KK yang konfirmasi hadir. Rute akan muncul saat warga mengonfirmasi."
        />
      ) : (
        <div className="space-y-2.5">
          {stops.map((s, i) => (
            <Card key={s.id} className="p-3.5">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-dark text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-dark">{s.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">RT {s.rt} · {tanggal(s.date)}</p>
                  <p className="mt-1 flex items-start gap-1 text-xs text-gray-400">
                    <MapPin size={12} className="mt-0.5 shrink-0" /> {s.address}
                  </p>
                  <div className="mt-2">
                    <StatusBadge tone={s.status === "ON_THE_WAY" || s.status === "ARRIVED" ? "amber" : "green"}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </StatusBadge>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-brand-dark/5 pt-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press flex items-center justify-center gap-1 rounded-lg bg-brand-tint py-2 text-xs font-medium text-brand-dark"
                >
                  <Navigation size={13} /> Peta
                </a>
                {s.phone ? (
                  <a
                    href={`tel:${s.phone}`}
                    className="press flex items-center justify-center gap-1 rounded-lg bg-brand-tint py-2 text-xs font-medium text-brand-dark"
                  >
                    <Phone size={13} /> Telepon
                  </a>
                ) : (
                  <span className="flex items-center justify-center gap-1 rounded-lg bg-brand-tint/60 py-2 text-xs font-medium text-gray-400">
                    <Phone size={13} /> —
                  </span>
                )}
                <Link
                  href="/ksatria/timbang"
                  className="press flex items-center justify-center gap-1 rounded-lg bg-brand-dark py-2 text-xs font-semibold text-white"
                >
                  <Scale size={13} /> Timbang
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
