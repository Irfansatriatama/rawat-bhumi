import Link from "next/link";
import { prisma } from "@/lib/db";
import { getKsatriaProfile, openRequestsForKsatria } from "@/lib/ksatria";
import { tanggal } from "@/lib/format";

export default async function KsatriaDashboard() {
  const kp = await getKsatriaProfile();
  if (!kp) {
    return <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">Akun ini belum punya profil Ksatria. Hubungi admin.</p>;
  }

  const [open, schedules] = await Promise.all([
    openRequestsForKsatria(kp.id),
    prisma.pickupSchedule.findMany({ where: { ksatriaId: kp.id }, orderBy: { scheduledDate: "desc" }, take: 5, include: { rt: true } }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-brand-dark">Tugas Hari Ini</h1>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-brand-bg p-4">
          <p className="text-2xl font-semibold text-brand-dark">{open.length}</p>
          <p className="text-xs text-gray-500">KK menunggu ditimbang</p>
        </div>
        <div className="rounded-2xl bg-brand-bg p-4">
          <p className="text-2xl font-semibold text-brand-dark">{schedules.length}</p>
          <p className="text-xs text-gray-500">Jadwal terbaru</p>
        </div>
      </div>
      <Link href="/ksatria/rute" className="block rounded-xl bg-brand-dark px-4 py-3 text-center text-sm font-medium text-white">
        Lihat Rute →
      </Link>
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-500">Jadwal terbaru</h2>
        {schedules.map((s) => (
          <div key={s.id} className="rounded-xl bg-white p-3 text-sm ring-1 ring-black/5">
            RT {s.rt.number} · {tanggal(s.scheduledDate)} · {s.timeSlot}
          </div>
        ))}
      </div>
    </div>
  );
}
