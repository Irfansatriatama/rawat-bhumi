import { Route } from "lucide-react";
import { getKsatriaProfile, routeStopsForKsatria } from "@/lib/ksatria";
import { EmptyState } from "@/components/ui/primitives";
import { RouteStopCard } from "@/components/ksatria/route-stop-card";

export default async function RutePage() {
  const kp = await getKsatriaProfile();
  if (!kp) return <p className="text-sm text-gray-500">Bukan akun Ksatria.</p>;

  const stops = await routeStopsForKsatria(kp.id);

  return (
    <div className="space-y-5 p-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-brand-dark">Rute Pickup</h2>
          <p className="text-sm text-gray-500">Tandai progres tiap titik saat kamu menjemput.</p>
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
            <RouteStopCard key={s.id} stop={s} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
