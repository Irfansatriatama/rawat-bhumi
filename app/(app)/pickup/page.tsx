import Link from "next/link";
import {
  Star, Info, ChevronRight, Truck, MapPinCheck, CircleCheck,
  Leaf, Recycle, Trash2, TriangleAlert, Phone, MessageCircle, Clock,
  Package, ClipboardCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { kg } from "@/lib/format";
import { SCHEDULE_STATUS } from "@/lib/prisma-enums";
import { Card } from "@/components/ui/primitives";
import { PickupHeader } from "@/components/app/pickup-header";
import { PickupHeroActions } from "@/components/app/pickup-hero-actions";
import { PickupInfoCard } from "@/components/app/pickup-info-card";

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function tanggalPanjang(d: Date): string {
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}
function tanggalPendek(d: Date): string {
  return `${d.getDate()} ${BULAN[d.getMonth()].slice(0, 3)}`;
}
function jamWib(slot: string): string {
  return `${slot.replaceAll(":", ".")} WIB`;
}

export default async function PickupPage() {
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

  const lastWaste = pid
    ? await prisma.wasteRecord.findFirst({ where: { userId: pid }, orderBy: { recordedAt: "desc" } })
    : null;

  // ---- Nilai tampil (data asli → fallback persis mockup) ----
  const date = schedule?.scheduledDate ?? new Date("2025-06-14T08:00:00");
  const createdAt = schedule?.createdAt ?? new Date("2025-06-10T00:00:00");
  const slot = schedule?.timeSlot ?? "08:00 - 10:00";
  const kurirNama = kurirUser?.name ?? "Ahmad";
  const kurirAvatar = schedule?.ksatria?.userProfile?.avatarUrl ?? kurirUser?.image ?? null;
  const inProgress = schedule?.status === SCHEDULE_STATUS.IN_PROGRESS;
  const confirmed = !!myRequest?.confirmedAt || myRequest?.status === "CONFIRMED";

  const wil = profile?.rt
    ? `RT ${profile.rt.number} / RW ${profile.rt.rw.number}, Kel. ${profile.rt.rw.kelurahan.name}, ${profile.rt.rw.kelurahan.kota}`
    : "Kel. Cipete, Kec. Cipete, Jakarta Selatan";
  // Informasi pickup: snapshot request (jika sudah konfirmasi) → default profil warga.
  const pickupInfo = {
    address: myRequest?.address ?? profile?.address ?? "",
    instruction: myRequest?.instruction ?? profile?.pickupInstruction ?? "",
    note: myRequest?.notes ?? profile?.pickupNote ?? schedule?.notes ?? "",
  };

  // Countdown ke jadwal → badge "2H4" (server render, satu kali)
  // eslint-disable-next-line react-hooks/purity
  const diffMs = date.getTime() - Date.now();
  const dDays = Math.max(0, Math.floor(diffMs / 86400000));
  const dHours = Math.max(0, Math.floor((diffMs % 86400000) / 3600000));
  const countdown = diffMs > 0 ? `${dDays}H${dHours}` : "NOW";

  // Estimasi sampah (record terakhir → fallback mockup, dalam gram)
  const est = {
    organik: lastWaste?.organikGrams ?? 10200,
    anorganik: lastWaste?.anorganikGrams ?? 4600,
    residu: lastWaste?.residuGrams ?? 2500,
    b3: lastWaste?.b3Grams ?? 200,
  };

  return (
    <div className="bg-brand-tint">
      <PickupHeader />

      <div className="space-y-3.5 p-4">
        {/* ===== HERO PICKUP BERIKUTNYA ===== */}
        <section className="relative overflow-hidden rounded-[26px] p-5 text-white [box-shadow:var(--shadow-soft)] app-header">
          {/* truk + ornamen */}
          <div className="pointer-events-none absolute -right-6 top-2 opacity-90">
            <Truck size={150} strokeWidth={1.1} className="text-white/15" />
          </div>
          <div className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-lime">
                Pickup Berikutnya
              </p>
              <span className="rounded-lg bg-brand/90 px-2 py-1 text-[11px] font-bold text-brand-deep">
                {countdown}
              </span>
            </div>

            <h2 className="mt-3 text-[26px] font-bold leading-tight tracking-tight">
              {tanggalPanjang(date)}
            </h2>
            <p className="mt-1 text-lg font-medium text-white/80">{jamWib(slot)}</p>

            {/* Kurir */}
            <div className="mt-4 flex items-center gap-3">
              {kurirAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={kurirAvatar} alt={kurirNama} className="h-12 w-12 rounded-full object-cover ring-2 ring-white/30" />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15 ring-2 ring-white/30">
                  <Truck size={22} className="text-white" />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[11px] text-white/60">Kurir di Bumi</p>
                <p className="font-semibold leading-tight">{kurirNama}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-lime">
                  <Star size={12} className="fill-current" /> 4.8
                </p>
              </div>
            </div>

            <PickupHeroActions scheduleId={schedule?.id} confirmed={confirmed} />
          </div>
        </section>

        {/* Info ecoin */}
        <p className="flex items-center gap-2 px-1 text-xs text-gray-500">
          <Info size={14} className="shrink-0 text-brand-600" />
          Info! Pastikan sisa ecoin-besar pukul 20:00
        </p>

        {/* ===== DETAIL PICKUP (stepper) ===== */}
        <Card className="p-4" id="detail">
          <SectionLabel>Detail Pickup</SectionLabel>
          <div className="mt-4 flex items-start">
            <Step icon={ClipboardCheck} label="Dijadwalkan" sub={tanggalPendek(createdAt)} done first />
            <StepLine done={inProgress} />
            <Step icon={Truck} label="Kurir Dijemput" sub={tanggalPendek(date)} done={inProgress} current={inProgress} />
            <StepLine />
            <Step icon={MapPinCheck} label="Tiba di Lokasi" />
            <StepLine />
            <Step icon={CircleCheck} label="Selesai" last />
          </div>
        </Card>

        {/* ===== INFORMASI PICKUP ===== */}
        <PickupInfoCard info={pickupInfo} wilayah={wil} jadwalLabel={tanggalPanjang(date)} />

        {/* ===== PANDUAN SEBELUM PICKUP ===== */}
        <Card className="p-4">
          <SectionLabel>Panduan Sebelum Pickup</SectionLabel>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <Guide icon={Package} text="Pisahkan sampah sesuai kategori" href="/belajar" />
            <Guide icon={Trash2} text="Gunakan kantong atau wadah tertutup" href="/belajar" />
            <Guide icon={ClipboardCheck} text="Letakkan di lokasi yang mudah diakses" href="/belajar" />
            <Guide icon={Clock} text="Pastikan sesuai jadwal pickup" href="/pickup/jadwal" />
          </div>
        </Card>

        {/* ===== ESTIMASI SAMPAH ===== */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <SectionLabel>Estimasi Sampah</SectionLabel>
            <Link href="/pickup/riwayat" className="flex items-center gap-0.5 text-xs font-medium text-brand-600">
              Lihat Detail <ChevronRight size={14} />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <Est icon={Leaf} label="Organik" value={kg(est.organik)} color="text-brand-600" />
            <Est icon={Recycle} label="Anorganik" value={kg(est.anorganik)} color="text-sky-600" />
            <Est icon={Trash2} label="Residu" value={kg(est.residu)} color="text-slate-500" />
            <Est icon={TriangleAlert} label="B3 & E-Waste" value={kg(est.b3)} color="text-brand-amber" />
          </div>
        </Card>

        {/* ===== BANTUAN CEPAT ===== */}
        <Card className="p-4">
          <SectionLabel>Bantuan Cepat</SectionLabel>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Help icon={Phone} text="Hubungi Tim Rawat Bhumi" href="tel:+628111222333" />
            <Help icon={MessageCircle} text="Bantuan & Pertanyaan" href="https://wa.me/628111222333" />
            <Help icon={TriangleAlert} text="Laporkan Masalah" href="mailto:halo@rawatbhumi.id?subject=Laporan%20Masalah%20Pickup" />
          </div>
        </Card>

        {/* ===== WAKTU OPERASIONAL ===== */}
        <Card className="p-4" id="jadwal">
          <SectionLabel>Waktu Operasional</SectionLabel>
          <div className="mt-3 space-y-3 text-[13px]">
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="shrink-0 text-brand-600" />
              <p className="text-gray-600">Senin - Sabtu: 08.00 - 16.00 WIB</p>
              <Link href="/pickup/jadwal" className="ml-auto flex shrink-0 items-center gap-0.5 text-xs font-medium text-brand-600">
                Lihat detail <ChevronRight size={13} />
              </Link>
            </div>
            <div className="flex items-start gap-2.5">
              <TriangleAlert size={16} className="mt-0.5 shrink-0 text-brand-amber" />
              <p className="text-gray-600">Minggu &amp; Hari Libur: Booking hanya untuk esok hari</p>
            </div>
            <div className="flex items-center gap-2.5">
              <Info size={16} className="shrink-0 text-gray-400" />
              <p className="text-gray-500">Info! Lacak status pickup menuju lebih bersih.</p>
              <span className="ml-auto shrink-0 text-[11px] text-gray-400">{tanggalPendek(createdAt)} {createdAt.getFullYear()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- sub-komponen presentasional ---------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[12px] font-bold uppercase tracking-wide text-brand-dark">{children}</h3>
  );
}

function Step({
  icon: Icon, label, sub, done, current,
}: {
  icon: LucideIcon; label: string; sub?: string; done?: boolean; current?: boolean; first?: boolean; last?: boolean;
}) {
  return (
    <div className="flex w-0 flex-1 flex-col items-center text-center">
      <span
        className={`grid h-11 w-11 place-items-center rounded-full ${
          done ? "bg-brand-600 text-white" : "bg-brand-soft text-brand-600/40"
        } ${current ? "ring-4 ring-brand-soft" : ""}`}
      >
        <Icon size={20} strokeWidth={2.2} />
      </span>
      <p className={`mt-2 text-[11px] font-semibold leading-tight ${done ? "text-brand-dark" : "text-gray-400"}`}>
        {label}
      </p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </div>
  );
}

function StepLine({ done }: { done?: boolean }) {
  return <span className={`mt-5 h-[3px] flex-1 rounded-full ${done ? "bg-brand-600" : "bg-brand-soft"}`} />;
}


function Guide({ icon: Icon, text, href }: { icon: LucideIcon; text: string; href?: string }) {
  const inner = (
    <>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft">
        <Icon size={26} strokeWidth={1.8} className="text-brand-600" />
      </span>
      <p className="mt-2 text-[10.5px] font-medium leading-tight text-gray-500">{text}</p>
    </>
  );
  return href ? (
    <Link href={href} className="press flex flex-col items-center text-center">{inner}</Link>
  ) : (
    <div className="flex flex-col items-center text-center">{inner}</div>
  );
}

function Est({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon size={22} strokeWidth={1.9} className={color} />
      <p className="mt-1.5 text-[11px] text-gray-500">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value} kg</p>
    </div>
  );
}

function Help({ icon: Icon, text, href }: { icon: LucideIcon; text: string; href: string }) {
  return (
    <a href={href} className="press flex flex-col items-center gap-2 rounded-2xl bg-brand-tint/60 px-1 py-3 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-soft">
        <Icon size={18} strokeWidth={2} className="text-brand-600" />
      </span>
      <span className="text-[11px] font-medium leading-tight text-gray-600">{text}</span>
    </a>
  );
}
