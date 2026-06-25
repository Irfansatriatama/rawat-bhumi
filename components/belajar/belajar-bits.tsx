import Link from "next/link";
import { Play, BookOpen, ChevronRight } from "lucide-react";
import { CONTENT_CATEGORY_LABEL } from "@/lib/belajar";
import { youtubeId, youtubeThumb } from "@/lib/youtube";

/** Bentuk minimal materi yang dipakai kartu (kompatibel dgn EducationContent Prisma). */
export type MateriLite = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  imageUrl: string | null;
  videoUrl: string | null;
  viewCount: number;
};

/** Judul seksi + tautan "Lihat Semua" (gaya halaman Belajar). */
export function SectionHead({ title, href, action = "Lihat Semua" }: { title: string; href?: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-bold tracking-tight text-brand-dark">{title}</h2>
      {href && (
        <Link href={href} className="press flex items-center gap-0.5 text-xs font-semibold text-brand-600">
          {action} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

/** "4.8K menonton" dari angka view. */
export function formatViews(n: number): string {
  const v = n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n);
  return `${v} menonton`;
}

/** Durasi video deterministik (mm:ss) dari slug — sementara, belum ada field durasi. */
export function durasiVideo(seed: string): string {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const min = 3 + (h % 5); // 3..7 menit
  const sec = h % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Thumbnail materi dgn tombol play & badge durasi. */
export function VideoThumb({
  m,
  className = "",
}: {
  m: MateriLite;
  className?: string;
}) {
  const vid = youtubeId(m.videoUrl);
  const poster = m.imageUrl || (vid ? youtubeThumb(vid) : null);
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-dark/15 to-brand/15 ${className}`}>
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={m.title} className="h-full w-full object-cover" />
      )}
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-brand-dark shadow">
          {m.videoUrl ? <Play size={18} className="ml-0.5 fill-current" /> : <BookOpen size={18} />}
        </span>
      </span>
      {m.videoUrl && (
        <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {durasiVideo(m.slug)}
        </span>
      )}
    </div>
  );
}

/** Kartu rekomendasi (kolom sempit, horizontal scroll). */
export function RecommendCard({ m }: { m: MateriLite }) {
  return (
    <Link href={`/belajar/${m.slug}`} className="press w-[44%] shrink-0 snap-start sm:w-[38%]">
      <VideoThumb m={m} className="aspect-[4/3]" />
      <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug text-brand-dark">{m.title}</p>
      <p className="mt-1 text-[11px] text-gray-400">
        {m.videoUrl ? "Video" : "Artikel"} • {formatViews(m.viewCount)}
      </p>
    </Link>
  );
}

/** Baris materi penuh-lebar (dipakai di kategori & hasil cari). */
export function MateriRow({ m }: { m: MateriLite }) {
  return (
    <Link href={`/belajar/${m.slug}`} className="press block">
      <div className="flex items-center gap-3 rounded-[var(--radius-card)] bg-white p-3 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
        <VideoThumb m={m} className="h-[68px] w-[96px] shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
            {CONTENT_CATEGORY_LABEL[m.category] ?? m.category}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-brand-dark">{m.title}</p>
          <p className="mt-1 text-[11px] text-gray-400">
            {m.videoUrl ? "Video" : "Artikel"} • {formatViews(m.viewCount)}
          </p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-gray-300" />
      </div>
    </Link>
  );
}
