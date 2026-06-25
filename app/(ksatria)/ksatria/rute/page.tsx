import Link from "next/link";
import { getKsatriaProfile, openRequestsForKsatria } from "@/lib/ksatria";
import { namesByProfileId } from "@/lib/users";
import { tanggal } from "@/lib/format";

export default async function RutePage() {
  const kp = await getKsatriaProfile();
  if (!kp) return <p className="text-sm text-gray-500">Bukan akun Ksatria.</p>;

  const reqs = await openRequestsForKsatria(kp.id);
  const names = await namesByProfileId(reqs.map((r) => r.userId));

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-brand-dark">Rute Pickup</h1>
      {reqs.length === 0 ? (
        <p className="text-sm text-gray-400">Belum ada KK yang konfirmasi hadir.</p>
      ) : (
        reqs.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-brand-dark">{names.get(r.userId) ?? "-"}</p>
                <p className="text-xs text-gray-500">
                  RT {r.schedule.rt.number} · {tanggal(r.schedule.scheduledDate)} · {r.status}
                </p>
                <p className="text-xs text-gray-400">{r.address}</p>
              </div>
              <Link href="/ksatria/timbang" className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-brand-dark">
                Timbang
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
