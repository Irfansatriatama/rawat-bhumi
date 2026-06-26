import Link from "next/link";
import {
  ChevronRight, Scale, Truck, Coins, Leaf, CalendarDays, BadgeCheck,
  Map, Wallet, IdCard, Phone, MessageCircle, AlertTriangle, Info, LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession, getSessionLike } from "@/lib/session";
import { getKsatriaProfile } from "@/lib/ksatria";
import { calcKsatriaEarning } from "@/lib/business-rules";
import { rupiah } from "@/lib/format";
import { LogoutButton } from "@/components/auth/logout-button";
import { DutyToggle } from "@/components/ksatria/duty-toggle";
import { Card, EmptyState } from "@/components/ui/primitives";

type Row = { icon: LucideIcon; label: string; href: string; value?: string; external?: boolean };

const MENU_TUGAS: Row[] = [
  { icon: Map, label: "Rute Pickup", href: "/ksatria/rute" },
  { icon: Scale, label: "Input Timbangan", href: "/ksatria/timbang" },
  { icon: Wallet, label: "Penghasilan", href: "/ksatria/penghasilan" },
];
const MENU_BANTUAN: Row[] = [
  { icon: Phone, label: "Hubungi Koordinator", href: "tel:+628111222333", external: true },
  { icon: MessageCircle, label: "Bantuan & Pertanyaan", href: "https://wa.me/628111222333", external: true },
  { icon: AlertTriangle, label: "Laporkan Masalah", href: "mailto:halo@rawatbhumi.id?subject=Laporan%20Masalah%20Ksatria", external: true },
];

function MenuGroup({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <Card className="p-4">
      <h2 className="mb-1 text-sm font-bold text-brand-dark">{title}</h2>
      <div className="divide-y divide-brand-dark/5">
        {rows.map((r) => {
          const Icon = r.icon;
          const inner = (
            <>
              <Icon size={19} strokeWidth={1.9} className="shrink-0 text-brand-dark" />
              <span className="flex-1 text-sm font-medium text-brand-dark">{r.label}</span>
              {r.value && <span className="text-xs font-medium text-brand-600">{r.value}</span>}
              <ChevronRight size={17} className="text-gray-300" />
            </>
          );
          return r.external ? (
            <a key={r.label} href={r.href} className="press flex items-center gap-3.5 py-3">{inner}</a>
          ) : (
            <Link key={r.label} href={r.href} className="press flex items-center gap-3.5 py-3">{inner}</Link>
          );
        })}
      </div>
    </Card>
  );
}

export default async function KsatriaAkunPage() {
  const session = await getSession();
  const like = await getSessionLike();
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

  const profile = like?.profileId
    ? await prisma.userProfile.findUnique({ where: { id: like.profileId } })
    : null;

  // Performa sepanjang waktu
  const agg = await prisma.wasteRecord.aggregate({
    _sum: { totalGrams: true },
    _count: true,
    where: { ksatriaId: kp.id },
  });
  const totalKg = ((agg._sum.totalGrams ?? 0) / 1000).toFixed(0);
  const totalPickup = agg._count;

  // Estimasi penghasilan bulan ini
  const startMonth = new Date();
  startMonth.setDate(1);
  startMonth.setHours(0, 0, 0, 0);
  const recsMonth = await prisma.wasteRecord.findMany({
    where: { ksatriaId: kp.id, recordedAt: { gte: startMonth } },
    select: { totalGrams: true },
  });
  const gramsMonth = recsMonth.reduce((a, b) => a + b.totalGrams, 0);
  const est = calcKsatriaEarning(recsMonth.length, gramsMonth);

  // eslint-disable-next-line react-hooks/purity
  const monthsActive = Math.max(1, Math.round((Date.now() - new Date(kp.createdAt).getTime()) / (30 * 864e5)));

  const name = session?.user.name ?? "Ksatria";
  const initials = name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase();

  const ringkasan = [
    { icon: Leaf, value: totalKg, unit: "kg", label: "Total Diangkut" },
    { icon: Truck, value: `${totalPickup}`, unit: "", label: "Total Pickup" },
    { icon: CalendarDays, value: `${monthsActive}`, unit: "", label: "Bulan Aktif" },
  ];

  return (
    <div className="space-y-4 p-4 pb-6">
      {/* ===== PROFIL ===== */}
      <div className="flex items-center gap-3.5 px-1 pt-1">
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
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-600">
            <BadgeCheck size={12} /> Mitra Penjemput
          </span>
        </div>
      </div>

      {/* ===== STATUS BERTUGAS ===== */}
      <DutyToggle initial={kp.isOnDuty} />

      {/* ===== RINGKASAN PERFORMA ===== */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-brand-dark to-brand-deep p-5 text-white [box-shadow:var(--shadow-soft)]">
        <Truck className="pointer-events-none absolute -right-3 -top-3 text-white/10" size={96} />
        <div className="relative mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">Performaku</h2>
          <Link href="/ksatria/penghasilan" className="flex items-center text-xs font-medium text-brand-lime">
            Penghasilan <ChevronRight size={13} />
          </Link>
        </div>
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
        <div className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2.5">
          <Coins size={18} className="shrink-0 text-brand-lime" />
          <span className="text-xs text-white/80">Estimasi bulan ini</span>
          <span className="ml-auto text-sm font-bold">{rupiah(est.totalAmount)}</span>
        </div>
      </div>

      {/* ===== KENDARAAN & ID ===== */}
      <Card className="p-4">
        <h2 className="mb-1 text-sm font-bold text-brand-dark">Data Petugas</h2>
        <div className="divide-y divide-brand-dark/5">
          <div className="flex items-center gap-3.5 py-3">
            <IdCard size={19} strokeWidth={1.9} className="shrink-0 text-brand-dark" />
            <span className="flex-1 text-sm font-medium text-brand-dark">ID Pegawai</span>
            <span className="text-xs font-semibold text-brand-600">{kp.employeeId}</span>
          </div>
          <div className="flex items-center gap-3.5 py-3">
            <Truck size={19} strokeWidth={1.9} className="shrink-0 text-brand-dark" />
            <span className="flex-1 text-sm font-medium text-brand-dark">Kendaraan</span>
            <span className="text-xs font-medium text-gray-500">{kp.vehicleType ?? "—"}</span>
          </div>
          <div className="flex items-center gap-3.5 py-3">
            <BadgeCheck size={19} strokeWidth={1.9} className="shrink-0 text-brand-dark" />
            <span className="flex-1 text-sm font-medium text-brand-dark">Plat Nomor</span>
            <span className="text-xs font-medium text-gray-500">{kp.vehiclePlate ?? "—"}</span>
          </div>
        </div>
      </Card>

      {/* ===== MENU ===== */}
      <MenuGroup title="Tugasku" rows={MENU_TUGAS} />
      <MenuGroup title="Bantuan & Dukungan" rows={MENU_BANTUAN} />

      {/* ===== INFO ===== */}
      <p className="flex items-center justify-center gap-1.5 px-2 text-center text-[11px] text-gray-400">
        <Info size={13} className="shrink-0" /> Rawat Bhumi · Ksatria Bhumi
      </p>

      {/* ===== KELUAR ===== */}
      <LogoutButton className="press flex w-full items-center justify-center gap-2 rounded-[var(--radius-card)] bg-white py-4 text-sm font-bold text-brand-red ring-1 ring-brand-red/15">
        <LogOut size={17} /> Keluar Akun
      </LogoutButton>
    </div>
  );
}
