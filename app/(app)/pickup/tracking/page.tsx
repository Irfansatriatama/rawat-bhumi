import Link from "next/link";
import {
  Truck, Navigation, MapPin, Phone, MessageCircle, Star,
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

  const inProgress = schedule?.status === SCHEDULE_STATUS.IN_PROGRESS;
  const active = myRequest?.status
    ? STATUS_INDEX[myRequest.status] ?? 0
    : inProgress ? 2 : 1;

  const stage = active >= 4 ? "Selesai" : active >= 2 ? "Hari ini pickup" : "Terjadwal";
  const headline =
    active >= 4 ? "Pickup selesai" :
    active === 3 ? "Kurir sudah tiba di lokasimu" :
    active >= 2 ? "Kurir sedang dalam perjalanan" :
    active === 1 ? "Kurir sudah ditugaskan" :
    "Menunggu konfirmasi kurir";

  const alamat = myRequest?.address ?? profile?.address ?? "Jl. Wijaya Kusuma No. 12, RT 05 / RW 02";

  if (!schedule) {
    return (
      <div className="bg-brand-tint">
        <PickupHeader />
        <div className="p-4">
          <EmptyState
            icon={Navigation}
            title="Belum ada pickup untuk dilacak"
            hint="Saat ada penjemputan terjadwal, status pickup-mu akan muncul di sini."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-tint">
      <PickupHeader />

      <div className="space-y-3.5 p-4">
        {/* ===== STATUS HERO (berbasis tahap, bukan posisi live) ===== */}
        <Card className="overflow-hidden p-0">
          <div className="app-header relative overflow-hidden p-5 text-white">
            <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/5" />
            <Truck size={120} strokeWidth={1.1} className="pointer-events-none absolute -bottom-5 -right-3 text-white/10" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/15">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-lime" /> {stage}
              </span>
              <h2 className="mt-3 text-xl font-bold leading-snug">{headline}</h2>
              <p className="mt-1.5 flex items-center gap-1 text-sm text-white/80">
                <MapPin size={13} className="shrink-0" /> <span className="truncate">{alamat}</span>
              </p>
            </div>
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
