import { CalendarClock } from "lucide-react";
import { prisma } from "@/lib/db";
import { listKsatriaOptions } from "@/lib/users";
import { PickupCreateForm } from "@/components/admin/pickup-create-form";
import { PickupAssignSelect } from "@/components/admin/pickup-assign-select";
import { tanggal } from "@/lib/format";
import { Card, PageHeading, SectionTitle, EmptyState, StatusBadge } from "@/components/ui/primitives";

const STATUS_TONE: Record<string, "green" | "amber" | "teal" | "red" | "slate"> = {
  COMPLETED: "green",
  DONE: "green",
  SCHEDULED: "teal",
  PENDING: "amber",
  IN_PROGRESS: "amber",
  CANCELLED: "red",
};

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
    <div>
      <PageHeading title="Jadwal Pickup" subtitle="Buat jadwal mingguan & assign Ksatria Bhumi." />

      <div className="space-y-6">
        <PickupCreateForm rtOptions={rtOptions} ksatriaOptions={ksatriaOptions} />

        <div>
          <SectionTitle>
            Jadwal <span className="font-normal text-gray-400">({schedules.length})</span>
          </SectionTitle>
          {schedules.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="Belum ada jadwal"
              hint="Buat jadwal pickup mingguan dan assign Ksatria Bhumi untuk memulai."
            />
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-brand-dark/5 text-left text-xs uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tanggal</th>
                      <th className="px-4 py-3 font-medium">RT</th>
                      <th className="px-4 py-3 font-medium">Slot</th>
                      <th className="px-4 py-3 font-medium">Ksatria</th>
                      <th className="px-4 py-3 font-medium">Request</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr key={s.id} className="border-b border-brand-dark/5 last:border-0">
                        <td className="px-4 py-3 text-brand-dark">{tanggal(s.scheduledDate)}</td>
                        <td className="px-4 py-3 text-gray-500">RT {s.rt.number}/RW {s.rt.rw.number}</td>
                        <td className="px-4 py-3 text-gray-500">{s.timeSlot}</td>
                        <td className="px-4 py-3">
                          <PickupAssignSelect scheduleId={s.id} ksatriaOptions={ksatriaOptions} current={s.ksatriaId} />
                        </td>
                        <td className="px-4 py-3 text-gray-500">{s._count.pickupRequests}</td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={STATUS_TONE[s.status] ?? "slate"}>{s.status}</StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
