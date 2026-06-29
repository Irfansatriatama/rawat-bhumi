import Link from "next/link";
import {
  Truck, Navigation, MapPin, Phone, MessageCircle, Star, Clock,
  CalendarCheck, BadgeCheck, MapPinCheck, CircleCheck, PackageCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { SCHEDULE_STATUS, PICKUP_STATUS } from "@/lib/prisma-enums";
import { Card, EmptyState } from "@/components/ui/primitives";
import { PickupHeader } from "@/components/app/pickup-header";

const STEPS: { icon: LucideIcon; label: string; hint: string }[] = [
  { icon: CalendarCheck, label: "Dijadwalkan", hint: "Permintaan pickup dibuat" },
  { icon: BadgeCheck, label: "Dikonfirmasi", hint: "Kurir ditugaskan ke lokasimu" },
  { icon: Truck, label: "Dalam Perjalanan", hint: "Kurir menuju alamatmu" },
  { icon: MapPinCheck, label: "Tiba di Lokasi", hint: "Kurir sampai di titik pickup" },
  { icon: CircleCheck, label: "Selesai", hint: "Sampah berhasil dijemput" },
];

const STATUS_INDEX: Record<string, number> = {
  [PICKUP_STATUS.PENDING]: 0,
  [PICKUP_STATUS.CONFIRMED]: 1,
  [PICKUP_STATUS.ON_THE_WAY]: 2,
  [PICKUP_STATUS.ARRIVED]: 3,
  [PICKUP_STATUS.COMPLETED]: 4,
};

export default async function TrackingPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { rt: { include: { rw: { include: { kelurahan: true } } } } },
  });
  const pid = profile?.id;

  const schedule = profile?.rtId
    ? await prisma.pickupSchedule.findFirst({
        where: { rtId: profile.rtId, status: { in: [SCHEDULE_STATUS.SCHEDULED, SCHEDULE_STATUS.IN_PROGRESS] } },
        orderBy: { scheduledDate: "asc" },
        include: { ksatria: { include: { userProfile: true } } },
      })
    : null;

  const myRequest = pid && schedule
    ? await prisma.pickupRequest.findFirst({ where: { userId: pid, scheduleId: schedule.id } })
    : null;

  const kurirUser = schedule?.ksatria
    ? await prisma.user.findUnique({ where: { id: schedule.ksatria.userId } })
    : null;

  // ---- nilai tampil (data asli → fallback mockup) ----
  const kurirNama = kurirUser?.name ?? "Ahmad";
  const kurirAvatar = schedule?.ksatria?.userProfile?.avatarUrl ?? kurirUser?.image ?? null;
  const plat = schedule?.ksatria?.vehiclePlate ?? "B 9182 RBX";
  const kendaraan = schedule?.ksatria?.vehicleType ?? "Truk Pikap";
  const onDuty = schedule?.ksatria?.isOnDuty ?? true;

  const inProgress = schedule?.status === SCHEDULE_STATUS.IN_PROGRESS;
  const active = myRequest?.status
    ? STATUS_INDEX[myRequest.status] ?? 0
    : inProgress ? 2 : 1;

  const eta = active >= 4 ? "Selesai" : active === 3 ? "Sudah tiba" : active >= 2 ? "± 12 menit" : "Terjadwal";
  const headline =
    active >= 4 ? "Pickup selesai" :
    active === 3 ? "Kurir sudah tiba di lokasimu" :
    active >= 2 ? "Kurir sedang menuju lokasimu" :
    "Menunggu kurir berangkat";

  const alamat = myRequest?.address ?? profile?.address ?? "Jl. Wijaya Kusuma No. 12, RT 05 / RW 02";

  if (!schedule) {
    return (
      <div className="bg-brand-tint">
        <PickupHeader />
        <div className="p-4">
          <EmptyState
            icon={Navigation}
            title="Belum ada pickup untuk dilacak"
            hint="Saat ada penjemputan terjadwal, posisi kurir akan muncul di sini secara langsung."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-tint">
      <PickupHeader />

      <div className="space-y-3.5 p-4">
        {/* ===== PETA (simulasi) ===== */}
        <Card className="relative h-56 overflow-hidden p-0">
          {/* grid jalan */}
          <div
            className="absolute inset-0 bg-brand-soft"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,93,77,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(15,93,77,0.08) 1px,transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
          {/* rute */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 224" fill="none" preserveAspectRatio="none">
            <path d="M52 176 C 120 150, 110 80, 210 72 S 280 60, 276 56" stroke="#1f9d55" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
          </svg>
          {/* titik kurir */}
          <div className="absolute left-[14%] top-[74%]">
            <span className="absolute -inset-3 animate-ping rounded-full bg-brand/40" />
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-brand-dark text-white ring-4 ring-white shadow-lg">
              <Truck size={18} />
            </span>
          </div>
          {/* titik tujuan */}
          <div className="absolute right-[12%] top-[18%]">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-brand-red ring-2 ring-brand-red/30 shadow">
              <MapPin size={18} className="fill-brand-red/10" />
            </span>
          </div>
          {/* badge ETA */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-dark shadow">
            <Clock size={13} className="text-brand-600" /> ETA {eta}
          </div>
          <span className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow ${onDuty ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-600"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${onDuty ? "bg-white" : "bg-slate-500"}`} /> {onDuty ? "Online" : "Offline"}
          </span>
        </Card>

        {/* ===== STATUS HEADLINE ===== */}
        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft">
            <Navigation size={22} className="text-brand-600" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-brand-dark">{headline}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} className="shrink-0" /> <span className="truncate">{alamat}</span>
            </p>
          </div>
        </Card>

        {/* ===== KARTU KURIR ===== */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            {kurirAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={kurirAvatar} alt={kurirNama} className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-soft" />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-soft">
                <Truck size={24} className="text-brand-600" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-gray-400">Kurir di Bumi</p>
              <p className="font-semibold text-brand-dark">{kurirNama}</p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-0.5 text-brand-amber"><Star size={12} className="fill-current" /> 4.8</span>
                · {kendaraan} · {plat}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <a href="tel:+628111222333" className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-dark py-3 text-sm font-semibold text-white">
              <Phone size={16} /> Telepon
            </a>
            <a href="https://wa.me/628111222333" className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-soft py-3 text-sm font-semibold text-brand-600">
              <MessageCircle size={16} /> Chat
            </a>
          </div>
        </Card>

        {/* ===== TIMELINE STATUS ===== */}
        <Card className="p-4">
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-brand-dark">Status Perjalanan</h3>
          <ol className="mt-4">
            {STEPS.map((s, i) => {
              const done = i < active;
              const now = i === active;
              const Icon = s.icon;
              const reached = done || now;
              return (
                <li key={s.label} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${reached ? "bg-brand-600 text-white" : "bg-brand-soft text-brand-600/40"} ${now ? "ring-4 ring-brand-soft" : ""}`}>
                      <Icon size={16} strokeWidth={2.2} />
                    </span>
                    {i < STEPS.length - 1 && <span className={`my-1 w-[3px] flex-1 rounded-full ${done ? "bg-brand-600" : "bg-brand-soft"}`} />}
                  </div>
                  <div className={`pb-5 ${i === STEPS.length - 1 ? "pb-0" : ""}`}>
                    <p className={`text-sm font-semibold ${reached ? "text-brand-dark" : "text-gray-400"}`}>
                      {s.label}
                      {now && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-600">Sekarang</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{s.hint}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <Link href="/pickup" className="press flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-semibold text-brand-dark ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
          <PackageCheck size={17} className="text-brand-600" /> Lihat Detail Pickup
        </Link>
      </div>
    </div>
  );
}
