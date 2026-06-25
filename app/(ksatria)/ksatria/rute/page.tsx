import Link from "next/link";
import { MapPin, Scale, Route, ChevronRight } from "lucide-react";
import { getKsatriaProfile, openRequestsForKsatria } from "@/lib/ksatria";
import { namesByProfileId } from "@/lib/users";
import { tanggal } from "@/lib/format";
import { Card, IconChip, EmptyState, StatusBadge } from "@/components/ui/primitives";

export default async function RutePage() {
  const kp = await getKsatriaProfile();
  if (!kp) return <p className="text-sm text-gray-500">Bukan akun Ksatria.</p>;

  const reqs = await openRequestsForKsatria(kp.id);
  const names = await namesByProfileId(reqs.map((r) => r.userId));

  return (
    <div className="space-y-5 p-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-brand-dark">Rute Pickup</h2>
        <p className="text-sm text-gray-500">KK yang sudah konfirmasi hadir & siap dijemput.</p>
      </div>

      {reqs.length === 0 ? (
        <EmptyState
          icon={Route}
          title="Belum ada KK"
          hint="Belum ada KK yang konfirmasi hadir. Rute akan muncul saat warga mengonfirmasi."
        />
      ) : (
        <div className="space-y-2.5">
          {reqs.map((r) => (
            <Card key={r.id} className="p-3.5">
              <div className="flex items-start gap-3">
                <IconChip icon={MapPin} tone="teal" size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-dark">{names.get(r.userId) ?? "-"}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    RT {r.schedule.rt.number} · {tanggal(r.schedule.scheduledDate)}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{r.address}</p>
                  <div className="mt-2">
                    <StatusBadge tone="green">{r.status}</StatusBadge>
                  </div>
                </div>
                <Link
                  href="/ksatria/timbang"
                  className="press flex shrink-0 items-center gap-1 rounded-xl bg-brand-dark px-3 py-2 text-xs font-semibold text-white"
                >
                  <Scale size={14} /> Timbang
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
