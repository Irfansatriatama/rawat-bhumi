import Link from "next/link";
import { Scale, CalendarDays, MapPin, ChevronRight, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getKsatriaProfile, openRequestsForKsatria } from "@/lib/ksatria";
import { tanggal } from "@/lib/format";
import { Card, StatCard, IconChip, SectionTitle, EmptyState } from "@/components/ui/primitives";

export default async function KsatriaDashboard() {
  const kp = await getKsatriaProfile();
  if (!kp) {
    return (
      <div className="p-4">
        <EmptyState
          icon={AlertTriangle}
          title="Profil Ksatria belum aktif"
          hint="Akun ini belum punya profil Ksatria. Hubungi admin untuk diaktifkan."
        />
      </div>
    );
  }

  const [open, schedules] = await Promise.all([
    openRequestsForKsatria(kp.id),
    prisma.pickupSchedule.findMany({ where: { ksatriaId: kp.id }, orderBy: { scheduledDate: "desc" }, take: 5, include: { rt: true } }),
  ]);

  return (
    <div className="space-y-5 p-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-brand-dark">Tugas Hari Ini</h2>
        <p className="text-sm text-gray-500">Ringkasan penjemputan & timbangan kamu.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Scale} tone="green" value={open.length} label="KK menunggu ditimbang" />
        <StatCard icon={CalendarDays} tone="teal" value={schedules.length} label="Jadwal terbaru" />
      </div>

      <Link
        href="/ksatria/rute"
        className="press flex items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3.5 text-sm font-semibold text-white"
      >
        Lihat Rute Hari Ini <ChevronRight size={16} />
      </Link>

      <section>
        <SectionTitle>Jadwal terbaru</SectionTitle>
        {schedules.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Belum ada jadwal" hint="Jadwal penjemputan akan muncul saat admin menugaskan kamu." />
        ) : (
          <div className="space-y-2.5">
            {schedules.map((s) => (
              <Card key={s.id} className="flex items-center gap-3 p-3.5">
                <IconChip icon={MapPin} tone="teal" size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-dark">RT {s.rt.number}</p>
                  <p className="text-xs text-gray-500">{tanggal(s.scheduledDate)} · {s.timeSlot}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
