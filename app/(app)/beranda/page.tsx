import Link from "next/link";
import {
  Bell, Truck, ChevronRight, Info, Check, MapPin, BadgeCheck,
  Sprout, Recycle, Trash2, TriangleAlert, Trophy, Target, Users,
  Cloud, Package, Leaf, ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { tanggal } from "@/lib/format";
import {
  SCHEDULE_STATUS, SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS, CONTENT_CATEGORY,
} from "@/lib/prisma-enums";
import { Card } from "@/components/ui/primitives";
import { LearnCarousel, type LearnItem } from "@/components/ui/learn-carousel";

const PLAN_LABEL: Record<string, string> = {
  [SUBSCRIPTION_PLAN.RUMAH_TANGGA]: "Paket Rumah Tangga",
  [SUBSCRIPTION_PLAN.PREMIUM]: "Paket Premium",
};
const CAT_LABEL: Record<string, string> = {
  [CONTENT_CATEGORY.PILAH_SAMPAH]: "Pilah Sampah",
  [CONTENT_CATEGORY.ORGANIK]: "Organik",
  [CONTENT_CATEGORY.ANORGANIK]: "Anorganik",
  [CONTENT_CATEGORY.RESIDU]: "Residu",
  [CONTENT_CATEGORY.B3]: "B3",
  [CONTENT_CATEGORY.MAGGOT_BSF]: "Maggot BSF",
  [CONTENT_CATEGORY.LINGKUNGAN]: "Lingkungan",
};

function SectionHead({ title, href, action = "Lihat Semua" }: { title: string; href?: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-brand-dark">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-medium text-brand-600">
          {action}
        </Link>
      )}
    </div>
  );
}

export default async function Beranda() {
  const session = await getSession();
  const userId = session!.user.id;

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { rt: { include: { rw: { include: { kelurahan: true } } } }, subscription: true },
  });
  const pid = profile?.id;

  // Dampak personal (data asli dari waste records)
  const agg = await prisma.wasteRecord.aggregate({
    _sum: { totalGrams: true, organikGrams: true, anorganikGrams: true, b3Grams: true, co2ReducedKg: true },
    where: { userId: pid },
  });
  const latest = pid
    ? await prisma.wasteRecord.findFirst({ where: { userId: pid }, orderBy: { recordedAt: "desc" } })
    : null;

  // Pickup berikutnya untuk RT
  const nextSchedule = profile?.rtId
    ? await prisma.pickupSchedule.findFirst({
        where: {
          rtId: profile.rtId,
          status: { in: [SCHEDULE_STATUS.SCHEDULED, SCHEDULE_STATUS.IN_PROGRESS] },
          scheduledDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        orderBy: { scheduledDate: "asc" },
        include: { ksatria: { include: { userProfile: true } } },
      })
    : null;
  let kurirName: string | null = null;
  if (nextSchedule?.ksatria) {
    const ku = await prisma.user.findUnique({
      where: { id: nextSchedule.ksatria.userProfile.userId },
      select: { name: true },
    });
    kurirName = ku?.name ?? null;
  }

  // Notifikasi belum dibaca (badge)
  const unread = await prisma.notification.count({ where: { userId, isRead: false } }).catch(() => 0);

  // Belajar (carousel)
  const contents = await prisma.educationContent.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });
  const learnItems: LearnItem[] = contents.map((c) => ({
    slug: c.slug,
    title: c.title,
    category: CAT_LABEL[c.category] ?? c.category,
    hasVideo: !!c.videoUrl,
    imageUrl: c.imageUrl,
  }));

  // Kontribusi RT bulan ini + ranking antar-RT (dihitung dari waste records)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [allProfiles, monthRecs] = await Promise.all([
    prisma.userProfile.findMany({ where: { rtId: { not: null } }, select: { id: true, rtId: true } }),
    prisma.wasteRecord.findMany({ where: { recordedAt: { gte: monthStart } }, select: { userId: true, totalGrams: true } }),
  ]);
  const rtByProfile = new Map(allProfiles.map((p) => [p.id, p.rtId!]));
  const sumByRt: Record<string, number> = {};
  monthRecs.forEach((r) => {
    const rt = rtByProfile.get(r.userId);
    if (rt) sumByRt[rt] = (sumByRt[rt] ?? 0) + r.totalGrams;
  });
  const ranking = Object.entries(sumByRt).sort((a, b) => b[1] - a[1]);
  const myRtKg = profile?.rtId ? (sumByRt[profile.rtId] ?? 0) / 1000 : 0;
  const myRank = profile?.rtId ? ranking.findIndex(([id]) => id === profile.rtId) + 1 : 0;
  // Target bulanan: heuristik dari jumlah KK (belum ada model target khusus)
  const target = Math.max(1000, (profile?.rt?.totalKK ?? 0) * 4);
  const targetPct = Math.min(100, Math.round((myRtKg / target) * 100));

  // Aktivitas saat ini — dari kategori pada setoran terakhir
  const acts: { label: string; sub: string; icon: LucideIcon; done: boolean }[] = [
    { label: "Organik", sub: "dijemput", icon: Sprout, done: (latest?.organikGrams ?? 0) > 0 },
    { label: "Anorganik", sub: "diolah", icon: Recycle, done: (latest?.anorganikGrams ?? 0) > 0 },
    { label: "Residu", sub: "dijadwalkan", icon: Trash2, done: (latest?.residuGrams ?? 0) > 0 },
    { label: "B3 & E-Waste", sub: "dijadwalkan", icon: TriangleAlert, done: (latest?.b3Grams ?? 0) > 0 },
  ];
  const doneCount = acts.filter((a) => a.done).length;
  const actPct = Math.round((doneCount / acts.length) * 100);

  // Stepper perjalanan sampah (tahap diturunkan dari ada/tidaknya setoran)
  const hasRecord = (agg._sum.totalGrams ?? 0) > 0;
  const STEPS = ["Dijemput", "Dipilah", "Diangkut", "Diolah", "Produk baru"];
  const activeStep = hasRecord ? 3 : 0;

  // Dampak (semua data asli)
  const dmpk = [
    { icon: Package, tone: "bg-brand-soft text-brand-600", value: ((agg._sum.totalGrams ?? 0) / 1000).toFixed(0), label: "Sampah terkelola" },
    { icon: Cloud, tone: "bg-brand-dark/10 text-brand-dark", value: (agg._sum.co2ReducedKg ?? 0).toFixed(0), label: "CO₂ tersimpan" },
    { icon: Recycle, tone: "bg-amber-100 text-brand-amber", value: ((agg._sum.anorganikGrams ?? 0) / 1000).toFixed(0), label: "Plastik terdaur" },
    { icon: Sprout, tone: "bg-lime-100 text-lime-700", value: ((agg._sum.organikGrams ?? 0) / 1000).toFixed(0), label: "Kompos organik" },
  ];

  const firstName = (session!.user.name ?? "Warga").split(" ")[0];
  const sub = profile?.subscription;
  const isActive = sub?.status === SUBSCRIPTION_STATUS.ACTIVE;
  const wilayah = profile?.rt
    ? `RT ${profile.rt.number} / RW ${profile.rt.rw.number}`
    : "Belum terpetakan";

  // Countdown ke pickup
  let countdown: string | null = null;
  if (nextSchedule) {
    const ms = nextSchedule.scheduledDate.getTime() - now.getTime();
    if (ms <= 0) countdown = "Hari ini";
    else {
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      countdown = d > 0 ? `${d}h ${h}j` : `${h}j`;
    }
  }

  return (
    <div className="bg-brand-tint">
      {/* ===== TOPBAR ===== */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-brand-dark/5 bg-white/90 px-4 py-3 backdrop-blur-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="Rawat Bhumi" className="h-9 w-9 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-brand-dark">Halo, {firstName} 👋</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
            {sub ? PLAN_LABEL[sub.plan] ?? sub.plan : "Belum berlangganan"}
            {sub && (
              <>
                <span className="text-gray-300">•</span>
                <span className={`inline-flex items-center gap-0.5 font-medium ${isActive ? "text-brand-600" : "text-brand-amber"}`}>
                  {isActive ? "Aktif" : "Perlu bayar"}
                  {isActive && <BadgeCheck size={12} className="fill-brand-600 text-white" />}
                </span>
              </>
            )}
          </p>
        </div>
        <Link href="/akun" className="press relative grid h-10 w-10 place-items-center rounded-full bg-brand-tint">
          <Bell size={18} className="text-brand-dark" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </header>

      <div className="space-y-5 p-4 pb-6">
        {/* ===== HERO ===== */}
        <div className="relative overflow-hidden rounded-[var(--radius-card)] [box-shadow:var(--shadow-soft)]">
          <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-dark via-brand-600 to-brand">
            {/* ornamen: skyline + truk + daun */}
            <div className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <Truck className="pointer-events-none absolute -bottom-3 right-3 text-white/15" size={130} strokeWidth={1.2} />
            <Leaf className="pointer-events-none absolute right-24 top-6 text-brand-lime/40" size={40} />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/45 to-transparent p-5">
              <h2 className="max-w-[16rem] text-lg font-bold leading-snug text-white">
                Bersama jaga Bhumi, kelola sampah hari ini untuk masa depan bersih.
              </h2>
              <p className="mt-1.5 text-xs text-white/80">Lestari hari ini, manfaat untuk nanti.</p>
            </div>
          </div>
        </div>

        {/* ===== RINGKASAN PICKUP ===== */}
        <Card className="overflow-hidden">
          {nextSchedule ? (
            <>
              <div className="flex items-start gap-3.5 p-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-dark text-white">
                  <Truck size={26} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Pickup berikutnya</p>
                    {countdown && (
                      <span className="rounded-lg bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand-600">
                        {countdown}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-base font-bold text-brand-dark">{tanggal(nextSchedule.scheduledDate)}</p>
                  <p className="text-xs text-gray-500">{nextSchedule.timeSlot} WIB</p>
                  {kurirName && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-600">
                        {kurirName.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-600">
                        Kurir Bhumi · <span className="font-medium text-brand-dark">{kurirName}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Link
                href="/pickup"
                className="press mx-4 mb-4 flex items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3 text-sm font-semibold text-white"
              >
                Lacak Pickup <ChevronRight size={16} />
              </Link>
              <div className="flex items-center gap-2 border-t border-brand-dark/5 bg-brand-tint/60 px-4 py-2.5">
                <Info size={14} className="shrink-0 text-brand-600" />
                <p className="text-xs text-gray-500">
                  {nextSchedule.notes ?? "Siapkan sampah yang sudah terpilah sebelum jam penjemputan."}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-tint">
                <Truck size={22} className="text-gray-400" />
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-dark">Belum ada jadwal pickup</p>
                <p className="text-xs text-gray-500">
                  {profile?.rtId ? "Jadwal akan muncul saat admin membuatnya." : "Kamu belum terhubung ke RT."}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* ===== AKTIVITAS SAAT INI ===== */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-brand-dark">Aktivitas saat ini</h2>
            <span className="text-xs font-semibold text-brand-600">{actPct}% selesai</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-brand-tint">
            <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark" style={{ width: `${Math.max(4, actPct)}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {acts.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.label} className="flex flex-col items-center gap-1.5">
                  <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-brand-tint">
                    <Icon size={22} className={a.done ? "text-brand-600" : "text-gray-400"} strokeWidth={1.8} />
                    <span
                      className={`absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full ${
                        a.done ? "bg-brand-600 text-white" : "border-2 border-gray-200 bg-white"
                      }`}
                    >
                      {a.done && <Check size={9} strokeWidth={3.5} />}
                    </span>
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold leading-tight text-brand-dark">{a.label}</p>
                    <p className="text-[10px] leading-tight text-gray-400">{a.done ? "tercatat" : a.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href="/belajar"
            className="press mt-4 flex items-center justify-between rounded-xl border border-brand-dark/8 px-3.5 py-2.5 text-sm font-medium text-brand-dark"
          >
            Lihat panduan pemilahan
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        </Card>

        {/* ===== BELAJAR 3 MENIT ===== */}
        {learnItems.length > 0 && (
          <section>
            <SectionHead title="Belajar 3 menit" href="/belajar" />
            <LearnCarousel items={learnItems} />
          </section>
        )}

        {/* ===== STEPPER PERJALANAN SAMPAH ===== */}
        <Card className="p-4">
          <SectionHead title="Perjalanan sampah" href="/komunitas" action="Lihat Detail" />
          <div className="flex items-start justify-between">
            {STEPS.map((s, i) => {
              const done = i < activeStep;
              const active = i === activeStep;
              return (
                <div key={s} className="relative flex flex-1 flex-col items-center">
                  {/* garis penghubung */}
                  {i < STEPS.length - 1 && (
                    <span
                      className={`absolute left-1/2 top-3.5 h-0.5 w-full ${i < activeStep ? "bg-brand-600" : "bg-gray-200"}`}
                    />
                  )}
                  <span
                    className={`relative z-10 grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${
                      done
                        ? "bg-brand-600 text-white"
                        : active
                          ? "bg-brand-dark text-white ring-4 ring-brand-dark/10"
                          : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </span>
                  <p className={`mt-1.5 text-center text-[10px] font-medium leading-tight ${active || done ? "text-brand-dark" : "text-gray-400"}`}>
                    {s}
                  </p>
                  {active && <p className="text-center text-[9px] text-brand-600">proses</p>}
                </div>
              );
            })}
          </div>
        </Card>

        {/* ===== KONTRIBUSI LINGKUNGAN ===== */}
        <Card className="p-4">
          <SectionHead title="Kontribusi lingkungan" href="/komunitas" />
          <div className="flex items-stretch gap-3">
            <div className="flex flex-1 items-center gap-2.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft">
                <Users size={20} className="text-brand-600" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-brand-dark">{wilayah}</p>
                <p className="flex items-center gap-0.5 truncate text-[11px] text-gray-500">
                  <MapPin size={10} /> {profile?.rt?.rw.kelurahan.name ?? "—"}
                </p>
              </div>
            </div>
            <div className="border-l border-brand-dark/5 pl-3 text-right">
              <p className="text-lg font-bold text-brand-dark">{myRtKg.toFixed(0)} <span className="text-xs font-medium text-gray-400">kg</span></p>
              <p className="text-[11px] text-gray-500">bulan ini</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 border-t border-brand-dark/5 pt-3">
            <div className="flex items-center gap-1.5">
              <Trophy size={15} className="text-amber-500" />
              <span className="text-xs text-gray-500">Ranking</span>
              <span className="text-sm font-bold text-brand-dark">#{myRank || "-"}</span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-gray-500"><Target size={11} /> Target {target} kg</span>
                <span className="font-semibold text-brand-600">{targetPct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-brand-tint">
                <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark" style={{ width: `${Math.max(3, targetPct)}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* ===== DAMPAK ANDA ===== */}
        <Card className="p-4">
          <SectionHead title="Dampak Anda" href="/akun/poin" action="Lihat Detail" />
          <div className="grid grid-cols-4 gap-2 text-center">
            {dmpk.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.label} className="flex flex-col items-center gap-1.5">
                  <span className={`grid h-10 w-10 place-items-center rounded-2xl ${d.tone}`}>
                    <Icon size={19} strokeWidth={1.9} />
                  </span>
                  <p className="text-base font-bold leading-none text-brand-dark">
                    {d.value}<span className="text-[10px] font-medium text-gray-400">kg</span>
                  </p>
                  <p className="text-[10px] leading-tight text-gray-500">{d.label}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* footer kecil */}
        <Link href="/komunitas" className="flex items-center justify-center gap-1 py-1 text-xs font-medium text-brand-600">
          Lihat semua kontribusi komunitas <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
