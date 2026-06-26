import Link from "next/link";
import {
  Scale, MapPin, ChevronRight, AlertTriangle, Truck, Coins,
  CheckCircle2, Power, Megaphone, Clock, ClipboardList,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  getKsatriaProfile, ksatriaTodayStats, routeStopsForKsatria, weighedTodayByKsatria,
} from "@/lib/ksatria";
import { USER_ROLE } from "@/lib/prisma-enums";
import { rupiah, tanggal } from "@/lib/format";
import { Card, StatCard, IconChip, SectionTitle, EmptyState } from "@/components/ui/primitives";

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function gr(g: number): string {
  return g >= 1000 ? `${(g / 1000).toFixed(1)} kg` : `${g} g`;
}

export default async function KsatriaBeranda() {
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

  const session = await getSession();
  const [stats, stops, weighedToday, announcements] = await Promise.all([
    ksatriaTodayStats(kp.id),
    routeStopsForKsatria(kp.id),
    weighedTodayByKsatria(kp.id),
    prisma.announcement.findMany({
      where: { isPublished: true, OR: [{ targetRole: null }, { targetRole: USER_ROLE.KSATRIA_BHUMI }] },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  const firstName = (session?.user.name ?? "Ksatria").split(" ")[0];
  const now = new Date();
  const tanggalHari = `${HARI[now.getDay()]}, ${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}`;
  const recentTasks = stops.slice(0, 5);

  return (
    <div className="space-y-5 p-4">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden rounded-[26px] p-5 text-white [box-shadow:var(--shadow-soft)] app-header">
        <Truck className="pointer-events-none absolute -right-5 -top-3 text-white/10" size={120} strokeWidth={1.1} />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium text-brand-lime">{tanggalHari}</p>
              <h2 className="mt-1 text-2xl font-bold leading-tight tracking-tight">Halo, {firstName}! 👋</h2>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                kp.isOnDuty ? "bg-white/20 text-white" : "bg-white/10 text-white/70"
              }`}
            >
              <Power size={13} /> {kp.isOnDuty ? "Bertugas" : "Libur"}
            </span>
          </div>
          <p className="mt-3 text-sm text-white/80">
            {stats.open > 0
              ? `Ada ${stats.open} rumah menunggu dijemput hari ini.`
              : "Belum ada tugas aktif. Mantap, semua beres! 🎉"}
          </p>
        </div>
      </section>

      {/* ===== STAT HARI INI ===== */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Scale} tone="green" value={stats.open} label="KK menunggu dijemput" />
        <StatCard icon={CheckCircle2} tone="teal" value={stats.doneToday} label="Selesai hari ini" />
        <StatCard icon={Truck} tone="lime" value={stats.kgToday.toFixed(1)} suffix="kg" label="Terangkut hari ini" />
        <StatCard icon={Coins} tone="amber" value={rupiah(stats.estToday)} label="Estimasi hari ini" />
      </div>

      {/* ===== PENGUMUMAN ===== */}
      <section>
        <SectionTitle>Pengumuman</SectionTitle>
        {announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="Belum ada pengumuman" hint="Pengumuman dari koordinator akan tampil di sini." />
        ) : (
          <div className="space-y-2.5">
            {announcements.map((a) => (
              <Card key={a.id} className="flex items-start gap-3 p-3.5">
                <IconChip icon={Megaphone} tone="amber" size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-dark">{a.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{a.body}</p>
                  {a.publishedAt && (
                    <p className="mt-1 text-[11px] text-gray-400">{tanggal(a.publishedAt)}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ===== TUGAS TERBARU ===== */}
      <section>
        <SectionTitle action={
          recentTasks.length > 0 ? (
            <Link href="/ksatria/tugas" className="flex items-center text-xs font-medium text-brand-600">
              Lihat Semua <ChevronRight size={13} />
            </Link>
          ) : undefined
        }>
          Tugas Terbaru
        </SectionTitle>
        {recentTasks.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Belum ada tugas" hint="Tugas muncul saat warga mengonfirmasi kehadiran pada jadwal." />
        ) : (
          <div className="space-y-2.5">
            {recentTasks.map((s, i) => (
              <Link key={s.id} href={`/ksatria/tugas/${s.id}`} className="press block">
                <Card className="flex items-center gap-3 p-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-dark text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-dark">{s.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
                      <MapPin size={11} className="shrink-0" /> RT {s.rt} · {tanggal(s.date)}
                    </p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-gray-300" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== DITIMBANG HARI INI ===== */}
      {weighedToday.length > 0 && (
        <section>
          <SectionTitle>Ditimbang hari ini</SectionTitle>
          <div className="space-y-2.5">
            {weighedToday.map((w) => (
              <Card key={w.id} className="flex items-center gap-3 p-3.5">
                <IconChip icon={CheckCircle2} tone="green" size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-dark">{w.name}</p>
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={11} /> {new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(w.recordedAt)} WIB
                  </p>
                </div>
                <span className="text-sm font-bold text-brand-dark">{gr(w.totalGrams)}</span>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
