import Link from "next/link";
import {
  Scale, CalendarDays, MapPin, ChevronRight, AlertTriangle,
  Truck, Coins, CheckCircle2, Clock, Power,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getKsatriaProfile, openRequestsForKsatria, ksatriaTodayStats, weighedTodayByKsatria } from "@/lib/ksatria";
import { tanggal } from "@/lib/format";
import { rupiah } from "@/lib/format";
import { Card, StatCard, IconChip, SectionTitle, EmptyState } from "@/components/ui/primitives";

function gr(g: number): string {
  return g >= 1000 ? `${(g / 1000).toFixed(1)} kg` : `${g} g`;
}

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

  const [open, schedules, stats, weighedToday] = await Promise.all([
    openRequestsForKsatria(kp.id),
    prisma.pickupSchedule.findMany({ where: { ksatriaId: kp.id }, orderBy: { scheduledDate: "desc" }, take: 5, include: { rt: true } }),
    ksatriaTodayStats(kp.id),
    weighedTodayByKsatria(kp.id),
  ]);

  return (
    <div className="space-y-5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-brand-dark">Tugas Hari Ini</h2>
          <p className="text-sm text-gray-500">Ringkasan penjemputan & timbangan kamu.</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            kp.isOnDuty ? "bg-brand-soft text-brand-600" : "bg-slate-100 text-slate-500"
          }`}
        >
          <Power size={13} /> {kp.isOnDuty ? "Bertugas" : "Libur"}
        </span>
      </div>

      {/* ===== STAT HARI INI ===== */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Scale} tone="green" value={open.length} label="KK menunggu ditimbang" />
        <StatCard icon={CheckCircle2} tone="teal" value={stats.doneToday} label="Selesai hari ini" />
        <StatCard icon={Truck} tone="lime" value={stats.kgToday.toFixed(1)} suffix="kg" label="Terangkut hari ini" />
        <StatCard icon={Coins} tone="amber" value={rupiah(stats.estToday)} label="Estimasi hari ini" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/ksatria/rute"
          className="press flex items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3.5 text-sm font-semibold text-white"
        >
          <MapPin size={16} /> Lihat Rute
        </Link>
        <Link
          href="/ksatria/timbang"
          className="press flex items-center justify-center gap-1.5 rounded-xl border border-brand-dark/10 bg-white py-3.5 text-sm font-semibold text-brand-dark"
        >
          <Scale size={16} /> Timbang
        </Link>
      </div>

      {/* ===== DITIMBANG HARI INI ===== */}
      <section>
        <SectionTitle>Ditimbang hari ini</SectionTitle>
        {weighedToday.length === 0 ? (
          <EmptyState icon={Clock} title="Belum ada timbangan" hint="Setoran yang kamu timbang hari ini akan tampil di sini." />
        ) : (
          <div className="space-y-2.5">
            {weighedToday.map((w) => (
              <Card key={w.id} className="flex items-center gap-3 p-3.5">
                <IconChip icon={CheckCircle2} tone="green" size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-dark">{w.name}</p>
                  <p className="text-xs text-gray-500">{new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(w.recordedAt)} WIB</p>
                </div>
                <span className="text-sm font-bold text-brand-dark">{gr(w.totalGrams)}</span>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ===== JADWAL TERBARU ===== */}
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
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  s.status === "COMPLETED" ? "bg-brand-soft text-brand-600" : s.status === "SCHEDULED" ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-brand-amber"
                }`}>{s.status}</span>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Link
        href="/ksatria/rute"
        className="press flex items-center justify-center gap-1 py-1 text-xs font-medium text-brand-600"
      >
        Mulai rute hari ini <ChevronRight size={14} />
      </Link>
    </div>
  );
}
