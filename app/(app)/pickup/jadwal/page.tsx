import Link from "next/link";
import {
  CalendarDays, Clock, Truck, ChevronRight, CircleDot, Ban, Info, CalendarPlus, MapPin,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { SCHEDULE_STATUS } from "@/lib/prisma-enums";
import { Card, EmptyState } from "@/components/ui/primitives";
import { PickupHeader } from "@/components/app/pickup-header";

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const HARI_URUT = [1, 2, 3, 4, 5, 6, 0]; // Senin → Minggu

function tanggalPanjang(d: Date) {
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}
function jamWib(slot: string) {
  return `${slot.replaceAll(":", ".")} WIB`;
}

export default async function JadwalPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { rt: { include: { rw: { include: { kelurahan: true } } } } },
  });

  const schedules = profile?.rtId
    ? await prisma.pickupSchedule.findMany({
        where: { rtId: profile.rtId },
        orderBy: { scheduledDate: "asc" },
        take: 30,
      })
    : [];

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const upcoming = schedules.filter((s) => s.scheduledDate.getTime() >= now && s.status !== SCHEDULE_STATUS.CANCELLED);
  const next = upcoming[0] ?? schedules[0] ?? null;

  // Hari pickup rutin → dari jadwal yang ada, fallback Selasa & Jumat
  const pickupDays = new Set(upcoming.map((s) => s.scheduledDate.getDay()));
  if (pickupDays.size === 0) { pickupDays.add(2); pickupDays.add(5); }
  const slotRutin = next?.timeSlot ?? schedules[0]?.timeSlot ?? "08:00 - 10:00";

  const wil = profile?.rt
    ? `RT ${profile.rt.number} / RW ${profile.rt.rw.number}, ${profile.rt.rw.kelurahan.name}`
    : "Kel. Cipete, Jakarta Selatan";

  return (
    <div className="bg-brand-tint">
      <PickupHeader />

      <div className="space-y-3.5 p-4">
        {/* ===== PICKUP BERIKUTNYA (ringkas) ===== */}
        {next ? (
          <Link href="/pickup" className="press block">
            <Card className="flex items-center gap-3 p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft">
                <Truck size={22} className="text-brand-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">Pickup Berikutnya</p>
                <p className="font-semibold text-brand-dark">{tanggalPanjang(next.scheduledDate)}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} /> {jamWib(next.timeSlot)}
                </p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-gray-300" />
            </Card>
          </Link>
        ) : (
          <EmptyState icon={CalendarDays} title="Belum ada jadwal" hint="Jadwal penjemputan untuk RT kamu akan tampil di sini begitu admin membuatnya." />
        )}

        {/* ===== JADWAL MINGGUAN ===== */}
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-brand-600" />
            <h3 className="text-[12px] font-bold uppercase tracking-wide text-brand-dark">Jadwal Mingguan · {wil}</h3>
          </div>
          <div className="mt-3 space-y-1">
            {HARI_URUT.map((d) => {
              const libur = d === 0;
              const pickup = pickupDays.has(d);
              return (
                <div key={d} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${pickup ? "bg-brand-soft" : ""}`}>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${pickup ? "bg-brand-600 text-white" : "bg-brand-tint text-gray-400"}`}>
                    {HARI[d].slice(0, 2)}
                  </span>
                  <p className={`flex-1 text-sm font-medium ${pickup ? "text-brand-dark" : "text-gray-500"}`}>{HARI[d]}</p>
                  {libur ? (
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Ban size={12} /> Libur</span>
                  ) : pickup ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-brand-600"><CircleDot size={12} /> {jamWib(slotRutin)}</span>
                  ) : (
                    <span className="text-xs text-gray-400">Tidak ada pickup</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* ===== JAM OPERASIONAL ===== */}
        <Card className="p-4">
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-brand-dark">Waktu Operasional</h3>
          <div className="mt-3 space-y-3 text-[13px]">
            <Row icon={Clock} tone="green">Senin – Sabtu: 08.00 – 16.00 WIB</Row>
            <Row icon={Ban} tone="amber">Minggu &amp; Hari Libur: Booking hanya untuk esok hari</Row>
            <Row icon={Info} tone="slate">Konfirmasi kehadiran sebelum pukul 20.00 di malam sebelum pickup.</Row>
          </div>
        </Card>

        {/* ===== JADWAL MENDATANG ===== */}
        {upcoming.length > 0 && (
          <Card className="p-4">
            <h3 className="text-[12px] font-bold uppercase tracking-wide text-brand-dark">Jadwal Mendatang</h3>
            <div className="mt-3 divide-y divide-brand-dark/5">
              {upcoming.slice(0, 8).map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-center leading-none">
                    <span className="text-[15px] font-bold text-brand-dark">{s.scheduledDate.getDate()}</span>
                    <span className="text-[9px] font-medium text-brand-600">{BULAN[s.scheduledDate.getMonth()].slice(0, 3)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-dark">{HARI[s.scheduledDate.getDay()]}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500"><Clock size={11} /> {jamWib(s.timeSlot)}</p>
                  </div>
                  <span className="rounded-full bg-brand-dark/10 px-2.5 py-1 text-[11px] font-medium text-brand-dark">Terjadwal</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Link href="/pickup" className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-dark py-3.5 text-sm font-semibold text-white">
          <CalendarPlus size={17} /> Kelola Pickup
        </Link>
      </div>
    </div>
  );
}

function Row({ icon: Icon, tone, children }: { icon: typeof Clock; tone: "green" | "amber" | "slate"; children: React.ReactNode }) {
  const color = tone === "green" ? "text-brand-600" : tone === "amber" ? "text-brand-amber" : "text-gray-400";
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={16} className={`mt-0.5 shrink-0 ${color}`} />
      <p className="text-gray-600">{children}</p>
    </div>
  );
}
