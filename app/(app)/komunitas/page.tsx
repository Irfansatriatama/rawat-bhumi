import Link from "next/link";
import {
  Leaf, Users, Trophy, Target, ChevronDown, ChevronRight, Megaphone,
  Truck, CloudSun, Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { tanggal } from "@/lib/format";
import { PageTopbar } from "@/components/ui/page-topbar";
import { WilayahSelect } from "@/components/ui/wilayah-select";
import { EventCarousel, type EventItem } from "@/components/ui/event-carousel";
import { Card, EmptyState } from "@/components/ui/primitives";

function lalu(d: Date): string {
  const ms = Date.now() - new Date(d).getTime();
  const h = Math.floor(ms / 36e5);
  if (h < 1) return "Baru saja";
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

function annIcon(title: string): { icon: LucideIcon; bg: string } {
  const t = title.toLowerCase();
  if (t.includes("pickup") || t.includes("jadwal") || t.includes("jemput")) return { icon: Truck, bg: "bg-brand-600" };
  if (t.includes("rapat") || t.includes("pengurus") || t.includes("rt") || t.includes("warga")) return { icon: CloudSun, bg: "bg-sky-500" };
  return { icon: Megaphone, bg: "bg-amber-500" };
}

export default async function KomunitasPage({
  searchParams,
}: {
  searchParams: Promise<{ rw?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session!.user.id },
    include: { rt: { include: { rw: { include: { kelurahan: true } } } } },
  });
  const myRwId = profile?.rt?.rwId ?? null;

  const rws = await prisma.rW.findMany({ include: { kelurahan: true }, orderBy: { number: "asc" } });
  const selectedRwId = sp.rw && rws.some((r) => r.id === sp.rw) ? sp.rw : myRwId ?? rws[0]?.id ?? "";

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [unread, allProfiles, monthRecs, rtsInRw, wargaAktif, challenge, events, anns] = await Promise.all([
    prisma.notification.count({ where: { userId: session!.user.id, isRead: false } }).catch(() => 0),
    prisma.userProfile.findMany({ where: { rtId: { not: null } }, select: { id: true, rtId: true } }),
    prisma.wasteRecord.findMany({ where: { recordedAt: { gte: monthStart } }, select: { userId: true, totalGrams: true } }),
    prisma.rT.findMany({ where: { rwId: selectedRwId }, include: { rw: true } }),
    profile?.rtId ? prisma.userProfile.count({ where: { rtId: profile.rtId, isActive: true } }) : Promise.resolve(0),
    prisma.challenge.findFirst({
      where: { isActive: true },
      orderBy: { endDate: "asc" },
      include: { _count: { select: { participations: true } }, participations: { select: { progress: true } } },
    }),
    prisma.communityEvent.findMany({ where: { isPublished: true }, orderBy: { date: "asc" }, take: 5 }),
    prisma.announcement.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" }, take: 5 }),
  ]);

  // ranking RT (bulan ini) dalam RW terpilih
  const rtByProfile = new Map(allProfiles.map((p) => [p.id, p.rtId!]));
  const sumByRt: Record<string, number> = {};
  monthRecs.forEach((r) => {
    const rt = rtByProfile.get(r.userId);
    if (rt) sumByRt[rt] = (sumByRt[rt] ?? 0) + r.totalGrams;
  });
  const ranking = rtsInRw
    .map((rt) => ({ id: rt.id, label: `RT ${rt.number} / RW ${rt.rw.number}`, kg: (sumByRt[rt.id] ?? 0) / 1000, mine: rt.id === profile?.rtId }))
    .sort((a, b) => b.kg - a.kg);
  const topKg = ranking[0]?.kg || 1;
  const myRtKg = profile?.rtId ? (sumByRt[profile.rtId] ?? 0) / 1000 : 0;
  const myRank = profile?.rtId ? ranking.findIndex((r) => r.id === profile.rtId) + 1 : 0;

  // target bulanan (heuristik dari jumlah KK)
  const target = Math.max(1000, (profile?.rt?.totalKK ?? 0) * 4);
  const targetPct = Math.min(100, Math.round((myRtKg / target) * 100));
  const sisa = Math.max(0, Math.round(target - myRtKg));

  // tantangan
  let chal: { title: string; range: string; pct: number; peserta: number } | null = null;
  if (challenge) {
    const avg = challenge.participations.length
      ? challenge.participations.reduce((s, p) => s + p.progress, 0) / challenge.participations.length
      : 0;
    chal = {
      title: challenge.title,
      range: `${tanggal(challenge.startDate)} - ${tanggal(challenge.endDate)}`,
      pct: Math.min(100, Math.round((avg / (challenge.targetValue || 1)) * 100)),
      peserta: challenge._count.participations,
    };
  }

  // opsi dropdown wilayah
  const options = rws.map((r) => ({
    id: r.id,
    label:
      r.id === myRwId && profile?.rt
        ? `RT ${profile.rt.number} / RW ${r.number}, Kel. ${r.kelurahan.name}`
        : `RW ${r.number}, Kel. ${r.kelurahan.name}`,
  }));

  const eventItems: EventItem[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    dateLabel: tanggal(e.date),
    timeLabel: e.timeLabel,
    location: e.location,
    imageUrl: e.imageUrl,
  }));

  const rankBg = (i: number) =>
    i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-orange-400 text-white" : "bg-brand-soft text-brand-600";

  return (
    <div>
      <PageTopbar title="Komunitas" unread={unread} />

      <div className="space-y-5 p-4 pb-6">
        {/* ===== WILAYAH ANDA ===== */}
        <div>
          <p className="mb-2 px-1 text-sm font-bold text-brand-dark">Wilayah Anda</p>
          <WilayahSelect options={options} value={selectedRwId} />
        </div>

        {/* ===== RINGKASAN LINGKUNGAN ===== */}
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-brand-dark to-brand-deep p-5 text-white [box-shadow:var(--shadow-soft)]">
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold">Ringkasan Lingkungan</h2>
            <span className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90">
              Bulan ini <ChevronDown size={13} />
            </span>
          </div>
          <div className="relative grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Leaf, value: `${myRtKg.toFixed(0)}`, unit: "kg", label: "Sampah Terkelola" },
              { icon: Users, value: `${wargaAktif}`, unit: "", label: "Warga Aktif" },
              { icon: Trophy, value: `#${myRank || "-"}`, unit: "", label: "Ranking RT" },
            ].map((s) => {
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

        {/* ===== RANKING RT ===== */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-brand-dark">Ranking RT</h2>
            <Link href="/komunitas" className="flex items-center text-xs font-medium text-brand-600">
              Lihat Semua <ChevronRight size={13} />
            </Link>
          </div>
          {ranking.length === 0 ? (
            <EmptyState icon={Trophy} title="Belum ada data" hint="Ranking muncul setelah ada setoran tercatat." />
          ) : (
            <div className="space-y-1">
              {ranking.slice(0, 5).map((row, i) => (
                <div
                  key={row.id}
                  className={`flex items-center gap-3 rounded-xl px-2 py-2.5 ${row.mine ? "bg-brand-soft/60 ring-1 ring-brand-600/15" : ""}`}
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${rankBg(i)}`}>
                    {i + 1}
                  </span>
                  <span className="w-[34%] shrink-0 truncate text-sm font-medium text-brand-dark">{row.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-tint">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-600" style={{ width: `${Math.max(5, (row.kg / topKg) * 100)}%` }} />
                  </div>
                  <span className="w-16 shrink-0 text-right text-sm font-bold text-brand-dark">
                    {row.kg.toLocaleString("id-ID", { maximumFractionDigits: 0 })} kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ===== TARGET BULANAN ===== */}
        <Card className="relative overflow-hidden p-4">
          <Leaf className="pointer-events-none absolute -bottom-3 -right-2 text-brand/15" size={88} />
          <div className="relative">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-brand-dark">Target Bulanan</h2>
              <span className="flex items-center text-xs font-medium text-brand-600">Lihat Detail <ChevronRight size={13} /></span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-brand-dark">
                {myRtKg.toFixed(0)} <span className="text-base font-medium text-gray-400">/ {target} kg</span>
              </p>
              <p className="text-xl font-bold text-brand-600">{targetPct}%</p>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-brand-tint">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark" style={{ width: `${Math.max(3, targetPct)}%` }} />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {sisa > 0 ? `Sisa ${sisa.toLocaleString("id-ID")} kg lagi untuk mencapai target` : "Target bulan ini tercapai. Hebat!"}
            </p>
          </div>
        </Card>

        {/* ===== TANTANGAN KOMUNITAS ===== */}
        {chal && (
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-brand-dark">Tantangan Komunitas</h2>
              <Link href="/komunitas" className="flex items-center text-xs font-medium text-brand-600">Lihat Semua <ChevronRight size={13} /></Link>
            </div>
            <div className="rounded-2xl bg-brand-soft/50 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-brand-dark">{chal.title}</p>
                  <p className="text-xs text-gray-500">{chal.range}</p>
                </div>
                <Sparkles size={18} className="shrink-0 text-brand-600" />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark" style={{ width: `${Math.max(4, chal.pct)}%` }} />
                </div>
                <span className="text-sm font-bold text-brand-dark">{chal.pct}%</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">{chal.peserta} warga ikut</p>
                <div className="flex items-center">
                  {Array.from({ length: Math.min(5, chal.peserta) }).map((_, i) => (
                    <span key={i} className="-ml-1.5 h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-brand to-brand-dark first:ml-0" />
                  ))}
                  {chal.peserta > 5 && (
                    <span className="-ml-1.5 grid h-6 min-w-6 place-items-center rounded-full border-2 border-white bg-brand-soft px-1 text-[10px] font-bold text-brand-600">
                      +{chal.peserta - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ===== EVENT & KEGIATAN ===== */}
        {eventItems.length > 0 && (
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-brand-dark">Event & Kegiatan</h2>
              <Link href="/komunitas" className="flex items-center text-xs font-medium text-brand-600">Lihat Semua <ChevronRight size={13} /></Link>
            </div>
            <EventCarousel items={eventItems} />
          </Card>
        )}

        {/* ===== PAPAN PENGUMUMAN ===== */}
        <Card className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-bold text-brand-dark">Papan Pengumuman</h2>
            <Link href="/komunitas" className="flex items-center text-xs font-medium text-brand-600">Lihat Semua <ChevronRight size={13} /></Link>
          </div>
          {anns.length === 0 ? (
            <EmptyState icon={Megaphone} title="Belum ada pengumuman" hint="Pengumuman dari pengurus akan tampil di sini." />
          ) : (
            <div className="divide-y divide-brand-dark/5">
              {anns.map((a, i) => {
                const meta = annIcon(a.title);
                const Icon = meta.icon;
                const when = a.publishedAt ?? a.createdAt;
                const isNew = Date.now() - new Date(when).getTime() < 36e5 * 24;
                return (
                  <div key={a.id} className="flex items-start gap-3 py-3">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${meta.bg} text-white`}>
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug text-brand-dark">{a.title}</p>
                        {i === 0 && isNew ? (
                          <span className="shrink-0 rounded-md bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">Baru</span>
                        ) : (
                          <span className="shrink-0 text-[11px] text-gray-400">{lalu(when)}</span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">{a.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
