import Link from "next/link";
import {
  ChevronRight, Leaf, Cloud, CalendarDays, Truck, LogOut,
  User, MapPin, CreditCard, History, Star, Bell, ShieldCheck, Globe,
  HelpCircle, PhoneCall, AlertTriangle, Info, Lock, FileText, Recycle, Award,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession, getSessionLike } from "@/lib/session";
import { tanggal } from "@/lib/format";
import { SCHEDULE_STATUS, SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS } from "@/lib/prisma-enums";
import { LogoutButton } from "@/components/auth/logout-button";
import { PageTopbar } from "@/components/ui/page-topbar";
import { Card } from "@/components/ui/primitives";

const PLAN_LABEL: Record<string, string> = {
  [SUBSCRIPTION_PLAN.RUMAH_TANGGA]: "Paket Rumah Tangga",
  [SUBSCRIPTION_PLAN.PREMIUM]: "Paket Premium",
};

type Row = { icon: LucideIcon; label: string; href: string; value?: string };

const MENU_AKUN: Row[] = [
  { icon: User, label: "Profil Saya", href: "/akun/profil" },
  { icon: MapPin, label: "Alamat Saya", href: "/akun/alamat" },
  { icon: CreditCard, label: "Pembayaran & Tagihan", href: "/akun/pembayaran" },
  { icon: History, label: "Riwayat Transaksi", href: "/pickup/riwayat" },
  { icon: Star, label: "Poin & Reward", href: "/akun/poin" },
  { icon: Award, label: "Sertifikat Dampak", href: "/akun/sertifikat" },
  { icon: Bell, label: "Pengaturan Notifikasi", href: "/akun/notifikasi" },
  { icon: ShieldCheck, label: "Keamanan Akun", href: "/akun/keamanan" },
  { icon: Globe, label: "Bahasa", href: "/akun/bahasa", value: "Bahasa Indonesia" },
];
const MENU_BANTUAN: Row[] = [
  { icon: HelpCircle, label: "Pusat Bantuan", href: "/akun/bantuan" },
  { icon: PhoneCall, label: "Hubungi Kami", href: "/akun/kontak" },
  { icon: AlertTriangle, label: "Laporkan Masalah", href: "/akun/laporan" },
];
const MENU_TENTANG: Row[] = [
  { icon: Info, label: "Tentang Kami", href: "/akun/tentang" },
  { icon: Lock, label: "Kebijakan Privasi", href: "/akun/privasi" },
  { icon: FileText, label: "Syarat & Ketentuan", href: "/akun/syarat" },
];

function MenuGroup({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <Card className="overflow-hidden p-4">
      <h2 className="mb-1 text-sm font-bold text-brand-dark">{title}</h2>
      <div className="divide-y divide-brand-dark/5">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <Link key={r.label} href={r.href} className="press flex items-center gap-3.5 py-3">
              <Icon size={19} strokeWidth={1.9} className="shrink-0 text-brand-dark" />
              <span className="flex-1 text-sm font-medium text-brand-dark">{r.label}</span>
              {r.value && <span className="text-xs font-medium text-brand-600">{r.value}</span>}
              <ChevronRight size={17} className="text-gray-300" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

export default async function AkunPage() {
  const session = await getSession();
  const like = await getSessionLike();
  const profile = like?.profileId
    ? await prisma.userProfile.findUnique({ where: { id: like.profileId }, include: { subscription: true } })
    : null;

  const agg = await prisma.wasteRecord.aggregate({
    _sum: { totalGrams: true, co2ReducedKg: true },
    where: { userId: profile?.id },
  });
  const totalKg = ((agg._sum.totalGrams ?? 0) / 1000).toFixed(0);
  const co2 = (agg._sum.co2ReducedKg ?? 0).toFixed(0);

  const sub = profile?.subscription;
  const isActive = sub?.status === SUBSCRIPTION_STATUS.ACTIVE;
  const planLabel = sub ? PLAN_LABEL[sub.plan] ?? sub.plan : null;

  // Bulan aktif sejak mulai langganan / dibuat
  const start = sub?.startDate ?? profile?.createdAt ?? new Date();
  // eslint-disable-next-line react-hooks/purity
  const monthsActive = Math.max(1, Math.round((Date.now() - new Date(start).getTime()) / (30 * 864e5)));

  // Jadwal pickup berikutnya
  const nextSchedule = profile?.rtId
    ? await prisma.pickupSchedule.findFirst({
        where: {
          rtId: profile.rtId,
          status: { in: [SCHEDULE_STATUS.SCHEDULED, SCHEDULE_STATUS.IN_PROGRESS] },
          scheduledDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        orderBy: { scheduledDate: "asc" },
      })
    : null;

  const unread = await prisma.notification.count({ where: { userId: session!.user.id, isRead: false } }).catch(() => 0);

  const name = session?.user.name ?? "Warga";
  const initials = name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase();

  const ringkasan = [
    { icon: Leaf, value: totalKg, unit: "kg", label: "Sampah Terkelola" },
    { icon: Cloud, value: co2, unit: "kg", label: "CO₂ Terkonversi" },
    { icon: CalendarDays, value: `${monthsActive}`, unit: "", label: "Bulan Aktif" },
  ];

  return (
    <div>
      <PageTopbar title="Akun" unread={unread} />

      <div className="space-y-4 p-4 pb-6">
        {/* ===== PROFIL ===== */}
        <Link href="/akun/profil" className="flex items-center gap-3.5 px-1 pt-1">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt={name} className="h-16 w-16 rounded-full object-cover ring-2 ring-brand-soft" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-dark text-lg font-bold text-white">
              {initials}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-brand-dark">{name}</p>
            <p className="truncate text-xs text-gray-500">{session?.user.email}</p>
            {planLabel && (
              <span className="mt-1.5 inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-600">
                {planLabel}
              </span>
            )}
          </div>
          <ChevronRight size={20} className="shrink-0 text-gray-300" />
        </Link>

        {/* ===== RINGKASAN SAYA ===== */}
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-brand-dark to-brand-deep p-5 text-white [box-shadow:var(--shadow-soft)]">
          <Leaf className="pointer-events-none absolute -right-3 -top-3 text-brand/20" size={96} />
          <Leaf className="pointer-events-none absolute right-10 top-6 text-brand-lime/30" size={36} />
          <h2 className="relative mb-4 text-base font-bold">Ringkasan Saya</h2>
          <div className="relative grid grid-cols-3 gap-2 text-center">
            {ringkasan.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center">
                  <span className="mb-2 grid h-14 w-14 place-items-center rounded-full bg-brand-600/90">
                    <Icon size={24} className="text-white" />
                  </span>
                  <p className="text-xl font-bold leading-none">
                    {s.value}
                    {s.unit && <span className="ml-0.5 text-xs font-medium text-white/70">{s.unit}</span>}
                  </p>
                  <p className="mt-1 text-[11px] text-white/70">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== LAYANAN SAYA ===== */}
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-brand-dark">Layanan Saya</h2>
            <Link href="/akun/pembayaran" className="flex items-center text-xs font-medium text-brand-600">
              Lihat Semua <ChevronRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-brand-dark/5">
            <div className="flex items-center gap-3 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft">
                <Recycle size={20} className="text-brand-600" />
              </span>
              <p className="flex-1 font-semibold text-brand-dark">{planLabel ?? "Belum berlangganan"}</p>
              {sub && (
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isActive ? "bg-brand-soft text-brand-600" : "bg-amber-100 text-brand-amber"}`}>
                  {isActive ? "Aktif" : "Perlu bayar"}
                </span>
              )}
            </div>
            <Link href="/pickup" className="press flex items-center gap-3 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-dark/10">
                <CalendarDays size={20} className="text-brand-dark" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-gray-400">Jadwal Pickup</p>
                {nextSchedule ? (
                  <>
                    <p className="text-sm font-bold text-brand-dark">{tanggal(nextSchedule.scheduledDate)}</p>
                    <p className="text-xs text-gray-500">{nextSchedule.timeSlot} WIB</p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-gray-500">Belum ada jadwal</p>
                )}
              </div>
              <span className="grid h-12 w-16 shrink-0 place-items-center rounded-xl bg-brand-tint">
                <Truck size={26} className="text-brand-dark" />
              </span>
              <ChevronRight size={17} className="shrink-0 text-gray-300" />
            </Link>
          </div>
        </Card>

        {/* ===== GRUP MENU ===== */}
        <MenuGroup title="Menu Akun" rows={MENU_AKUN} />
        <MenuGroup title="Bantuan & Dukungan" rows={MENU_BANTUAN} />
        <MenuGroup title="Tentang Rawat Bhumi" rows={MENU_TENTANG} />

        {/* ===== KELUAR ===== */}
        <LogoutButton className="press flex w-full items-center justify-center gap-2 rounded-[var(--radius-card)] bg-white py-4 text-sm font-bold text-brand-red ring-1 ring-brand-red/15">
          <LogOut size={17} /> Keluar Akun
        </LogoutButton>
      </div>
    </div>
  );
}
