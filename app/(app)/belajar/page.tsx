import Link from "next/link";
import {
  Bell, Search, ChevronRight, Check, ClipboardCheck,
  Target, Award, ShieldCheck, Flame, Leaf,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  BELAJAR_CATEGORIES, LEARNING_PATH, TIPS, QUIZ_DASAR, hitungStreak, deriveProgress, type Tone,
} from "@/lib/belajar";
import { BelajarHero, type HeroSlide } from "@/components/belajar/belajar-hero";
import {
  SectionHead, RecommendCard, VideoThumb, formatViews, type MateriLite,
} from "@/components/belajar/belajar-bits";

const TONE_TEXT: Record<Tone, string> = {
  green: "text-brand-600",
  teal: "text-brand-dark",
  amber: "text-amber-500",
  lime: "text-lime-600",
  red: "text-brand-red",
  slate: "text-slate-500",
};

/** % progres deterministik dari slug (sementara, belum ada model progres per-user). */
function progresMateri(slug: string): number {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 45 + (h % 45); // 45..89
}

export default async function BelajarPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const [contents, profile, unread] = await Promise.all([
    prisma.educationContent.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 50,
    }),
    prisma.userProfile.findUnique({ where: { userId }, select: { id: true, totalPoints: true } }),
    prisma.notification.count({ where: { userId, isRead: false } }).catch(() => 0),
  ]);

  // Streak nyata dari aktivitas poin
  const points = profile?.id
    ? await prisma.pointHistory.findMany({
        where: { userId: profile.id },
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      })
    : [];
  const streak = hitungStreak(points.map((p) => p.createdAt));

  // ===== Statistik turunan (sementara, tanpa model progres khusus) =====
  const poin = profile?.totalPoints ?? 0;
  const totalContents = contents.length;
  const { materiSelesai, sertifikat, pathDone, pathPct } = deriveProgress(poin, totalContents);

  // ===== Konten =====
  const cont = contents[0] as MateriLite | undefined; // terbaru → "Lanjutan Belajar"
  const contProgress = cont ? progresMateri(cont.slug) : 0;
  const rekomendasi = [...contents]
    .filter((c) => c.slug !== cont?.slug)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 6) as MateriLite[];

  const firstName = (session!.user.name ?? "Warga").split(" ")[0];
  const slides: HeroSlide[] = [
    {
      title: "Terus belajar, Bumi makin lestari!",
      subtitle: "Pelajari cara mengelola sampah dengan lebih baik.",
      cta: cont ? "Lanjutkan Belajar" : "Mulai Belajar",
      href: cont ? `/belajar/${cont.slug}` : "/belajar/kategori",
    },
    {
      title: "Uji pemahamanmu lewat quiz",
      subtitle: `Kerjakan ${QUIZ_DASAR.length} soal singkat seputar pengelolaan sampah.`,
      cta: "Mulai Quiz",
      href: "/belajar/quiz",
    },
    {
      title: `Halo ${firstName}, mulai dari memilah`,
      subtitle: "Ikuti jalur belajar untuk pemula langkah demi langkah.",
      cta: "Lihat Jalur",
      href: "/belajar/jalur",
    },
  ];

  const stats: { icon: LucideIcon; tone: string; value: number; label: string }[] = [
    { icon: Target, tone: "text-brand-600", value: materiSelesai, label: "Materi Selesai" },
    { icon: Award, tone: "text-brand-dark", value: sertifikat, label: "Sertifikat Diperoleh" },
    { icon: ShieldCheck, tone: "text-brand-600", value: streak, label: "Hari Belajar Berturut-turut" },
    { icon: Flame, tone: "text-amber-500", value: poin, label: "Poin Terkumpul" },
  ];

  return (
    <div className="bg-brand-tint">
      {/* ===== TOPBAR ===== */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-dark/5 bg-white/90 px-4 py-3 backdrop-blur-lg">
        <Link href="/beranda" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="Rawat Bhumi" className="h-9 w-9 rounded-xl" />
          <div className="leading-[1.05]">
            <p className="text-[15px] font-extrabold text-brand-dark">Rawat</p>
            <p className="text-[15px] font-extrabold text-brand-600">Bhumi</p>
          </div>
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-tight text-brand-dark">Belajar</h1>
        <Link href="/akun" className="press relative grid h-10 w-10 place-items-center rounded-full bg-brand-tint">
          <Bell size={18} className="text-brand-dark" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </header>

      <div className="space-y-6 p-4 pb-6">
        {/* ===== SEARCH ===== */}
        <form action="/belajar/cari" className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            type="search"
            placeholder="Cari materi, topik, atau kategori..."
            className="w-full rounded-2xl border border-brand-dark/8 bg-white py-3.5 pl-11 pr-4 text-sm text-brand-dark placeholder:text-gray-400 outline-none ring-brand-600/20 focus:ring-2"
          />
        </form>

        {/* ===== HERO CAROUSEL ===== */}
        <BelajarHero slides={slides} />

        {/* ===== KATEGORI BELAJAR ===== */}
        <section>
          <SectionHead title="Kategori Belajar" href="/belajar/kategori" />
          <div className="grid grid-cols-4 gap-2">
            {BELAJAR_CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.key} href={`/belajar/kategori/${c.key}`} className="press flex flex-col items-center gap-2 text-center">
                  <Icon size={34} strokeWidth={1.8} className={TONE_TEXT[c.tone]} />
                  <span className="text-[11px] font-semibold leading-tight text-brand-dark">{c.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ===== LANJUTAN BELAJAR ===== */}
        {cont && (
          <section>
            <SectionHead title="Lanjutan Belajar" href="/belajar/kategori" />
            <Link href={`/belajar/${cont.slug}`} className="press block">
              <div className="flex items-center gap-3 rounded-[var(--radius-card)] bg-white p-3 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
                <VideoThumb m={cont} className="h-[76px] w-[112px] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-bold leading-snug text-brand-dark">{cont.title}</p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {cont.videoUrl ? "Video" : "Artikel"} • {formatViews(cont.viewCount)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-tint">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${contProgress}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-brand-600">{contProgress}%</span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ===== MATERI REKOMENDASI ===== */}
        {rekomendasi.length > 0 && (
          <section>
            <SectionHead title="Materi Rekomendasi" href="/belajar/kategori" />
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4">
              {rekomendasi.map((m) => (
                <RecommendCard key={m.slug} m={m} />
              ))}
            </div>
          </section>
        )}

        {/* ===== JALUR BELAJAR UNTUK PEMULA ===== */}
        <section>
          <SectionHead title="Jalur Belajar Untuk Pemula" href="/belajar/jalur" />
          <div className="rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
            <div className="flex items-start justify-between">
              {LEARNING_PATH.map((s, i) => {
                const done = i < pathDone;
                const Icon = s.icon;
                return (
                  <div key={s.no} className="relative flex flex-1 flex-col items-center">
                    {i < LEARNING_PATH.length - 1 && (
                      <span className={`absolute left-1/2 top-4 h-0.5 w-full ${i < pathDone - 1 ? "bg-brand-600" : "bg-gray-200"}`} />
                    )}
                    <span
                      className={`relative z-10 grid h-8 w-8 place-items-center rounded-full ${
                        done ? "bg-brand-600 text-white" : "border border-gray-200 bg-white text-gray-400"
                      }`}
                    >
                      {done ? <Check size={15} strokeWidth={3} /> : <Icon size={15} strokeWidth={2} />}
                    </span>
                    <p className={`mt-1.5 text-center text-[10px] font-medium leading-tight ${done ? "text-brand-dark" : "text-gray-400"}`}>
                      {s.no}. {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-2.5">
              <span className="text-xs text-gray-500">
                Progres anda: <span className="font-bold text-brand-dark">{pathPct}%</span> ({pathDone}/{LEARNING_PATH.length} materi)
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-tint">
                <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark" style={{ width: `${Math.max(4, pathPct)}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* ===== LATIHAN QUIZ ===== */}
        <section>
          <SectionHead title="Latihan Quiz" href="/belajar/quiz" />
          <div className="rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
            <div className="flex items-center gap-3.5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft">
                <ClipboardCheck size={24} className="text-brand-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-brand-dark">Uji Pemahamanmu</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                  Kerjakan kuis singkat seputar materi yang kamu pelajari.
                </p>
                <p className="mt-1 text-[11px] text-gray-400">Level Dasar • {QUIZ_DASAR.length} Soal</p>
              </div>
            </div>
            <Link
              href="/belajar/quiz"
              className="press mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3 text-sm font-semibold text-white"
            >
              Mulai Quiz <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        {/* ===== PENCAPAIAN ===== */}
        <section>
          <SectionHead title="Pencapaian" />
          <div className="grid grid-cols-4 gap-2 rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon size={22} strokeWidth={1.9} className={s.tone} />
                  <p className="text-lg font-bold leading-none text-brand-dark">{s.value}</p>
                  <p className="text-[10px] leading-tight text-gray-500">{s.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== TAHUKAH KAMU? ===== */}
        <section>
          <SectionHead title="Tahukah Kamu?" href="/belajar/tips" />
          <div className="flex items-center gap-3.5 rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft">
              <Leaf size={24} className="text-brand-600" />
            </span>
            <p className="text-xs leading-relaxed text-gray-600">{TIPS[0]}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
