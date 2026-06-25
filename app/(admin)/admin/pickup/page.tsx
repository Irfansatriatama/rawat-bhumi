import { prisma } from "@/lib/db";
import { listKsatriaOptions } from "@/lib/users";
import { PickupCreateForm } from "@/components/admin/pickup-create-form";
import { PickupAssignSelect } from "@/components/admin/pickup-assign-select";
import { tanggal } from "@/lib/format";

export default async function PickupPage() {
  const [schedules, rts, ksatriaOptions] = await Promise.all([
    prisma.pickupSchedule.findMany({
      orderBy: { scheduledDate: "desc" },
      take: 100,
      include: { rt: { include: { rw: true } }, ksatria: true, _count: { select: { pickupRequests: true } } },
    }),
    prisma.rT.findMany({ include: { rw: true }, orderBy: { number: "asc" } }),
    listKsatriaOptions(),
  ]);
  const rtOptions = rts.map((rt) => ({ id: rt.id, label: `RT ${rt.number} / RW ${rt.rw.number}` }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-dark">Jadwal Pickup</h1>
        <p className="text-sm text-gray-500">Buat jadwal mingguan & assign Ksatria Bhumi.</p>
      </div>
      <PickupCreateForm rtOptions={rtOptions} ksatriaOptions={ksatriaOptions} />

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 font-semibold text-brand-dark">
          Jadwal <span className="text-sm font-normal text-gray-400">({schedules.length})</span>
        </h2>
        {schedules.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada jadwal.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr className="border-b border-black/5">
                  <th className="py-2 pr-4">Tanggal</th>
                  <th className="py-2 pr-4">RT</th>
                  <th className="py-2 pr-4">Slot</th>
                  <th className="py-2 pr-4">Ksatria</th>
                  <th className="py-2 pr-4">Request</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id} className="border-b border-black/5 last:border-0">
                    <td className="py-2 pr-4 text-gray-700">{tanggal(s.scheduledDate)}</td>
                    <td className="py-2 pr-4 text-gray-600">RT {s.rt.number}/RW {s.rt.rw.number}</td>
                    <td className="py-2 pr-4 text-gray-600">{s.timeSlot}</td>
                    <td className="py-2 pr-4">
                      <PickupAssignSelect scheduleId={s.id} ksatriaOptions={ksatriaOptions} current={s.ksatriaId} />
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{s._count.pickupRequests}</td>
                    <td className="py-2 pr-4">
                      <span className="rounded-full bg-brand-bg px-2 py-0.5 text-xs text-brand-dark">{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
