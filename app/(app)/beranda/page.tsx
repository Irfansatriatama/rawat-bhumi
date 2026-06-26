import Link from "next/link";
import {
  Bell, Truck, ChevronRight, Info, Check, MapPin, BadgeCheck,
  Sprout, Recycle, Trophy, Target, Users,
  Cloud, Package, Leaf, ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { tanggal } from "@/lib/format";
import {
  SCHEDULE_STATUS, SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS, CONTENT_CATEGORY,
} from "@/lib/prisma-enums";
import { getDayActivity } from "@/lib/activity";
import { getWasteJourney } from "@/lib/journey";
import { Card } from "@/components/ui/primitives";
import { LearnCarousel, type LearnItem } from "@/components/ui/learn-carousel";
import { ActivityCard } from "@/components/beranda/activity-card";

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
  // Aktivitas pilah hari ini (manual tap + auto dari pickup hari ini)
  const todayActivity = pid ? await getDayActivity(pid) : [];

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

  // Perjalanan sampah — data-driven dari setoran warga + arus hilir komunitas
  const journey = pid ? await getWasteJourney(pid) : null;

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
        <img src="/logo-rawat-bhumi.png" alt="Rawat Bhumi" className="h-[37px] w-auto shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-brand-dark">Halo, {firstName}! 👋</p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-gray-500">
            <span className="truncate">{sub ? PLAN_LABEL[sub.plan] ?? sub.plan : "Belum berlangganan"}</span>
            {sub && (
              <>
                <span className="text-gray-300">•</span>
                <span className={`inline-flex shrink-0 items-center gap-0.5 font-medium ${isActive ? "text-brand-600" : "text-brand-amber"}`}>
                  {isActive ? "Aktif" : "Perlu bayar"}
                  {isActive && <BadgeCheck size={12} className="fill-brand-600 text-white" />}
                </span>
              </>
            )}
          </p>
        </div>
        <Link href="/akun" className="press relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-tint">
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

        {/* ===== AKTIVITAS HARI INI (interaktif: tap untuk catat) ===== */}
        <ActivityCard initial={todayActivity} />

        {/* ===== BELAJAR 3 MENIT ===== */}
        {learnItems.length > 0 && (
          <section>
            <SectionHead title="Belajar 3 menit" href="/belajar" />
            <LearnCarousel items={learnItems} />
          </section>
        )}

        {/* ===== PERJALANAN SAMPAH (data-driven) ===== */}
        {journey && (
          <Card className="p-4">
            <SectionHead title="Perjalanan sampah" href="/beranda/perjalanan" action="Lihat Detail" />
            <div className="flex items-start justify-between">
              {journey.stages.map((s, i) => (
                <div key={s.key} className="relative flex flex-1 flex-col items-center">
                  {/* garis penghubung */}
                  {i < journey.stages.length - 1 && (
                    <span className={`absolute left-1/2 top-3.5 h-0.5 w-full ${s.done ? "bg-brand-600" : "bg-gray-200"}`} />
                  )}
                  <span
                    className={`relative z-10 grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${
                      s.done
                        ? "bg-brand-600 text-white"
                        : s.active
                          ? "bg-brand-dark text-white ring-4 ring-brand-dark/10"
                          : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {s.done ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </span>
                  <p className={`mt-1.5 text-center text-[10px] font-medium leading-tight ${s.active || s.done ? "text-brand-dark" : "text-gray-400"}`}>
                    {s.label}
                  </p>
                  {s.active && <p className="text-center text-[9px] text-brand-600">proses</p>}
                </div>
              ))}
            </div>
            <Link
              href="/beranda/perjalanan"
              className="press mt-3 flex items-center gap-2 rounded-xl bg-brand-tint px-3 py-2.5"
            >
              <Info size={14} className="shrink-0 text-brand-600" />
              <span className="flex-1 text-xs font-medium text-brand-dark">{journey.summary}</span>
              <ChevronRight size={15} className="shrink-0 text-gray-400" />
            </Link>
          </Card>
        )}

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
