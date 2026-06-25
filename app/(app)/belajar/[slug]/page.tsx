import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, Eye, CalendarDays, ClipboardCheck, ChevronRight, BookOpen } from "lucide-react";
import { prisma } from "@/lib/db";
import { tanggal } from "@/lib/format";
import { AppHeader } from "@/components/ui/app-header";
import { CONTENT_CATEGORY_LABEL } from "@/lib/belajar";
import { MateriRow, formatViews, type MateriLite } from "@/components/belajar/belajar-bits";

export default async function ContentDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await prisma.educationContent.findUnique({ where: { slug } });
  if (!content || !content.isPublished) notFound();

  await prisma.educationContent.update({ where: { id: content.id }, data: { viewCount: { increment: 1 } } });

  // Materi terkait (kategori sama)
  const related = (await prisma.educationContent.findMany({
    where: { isPublished: true, category: content.category, slug: { not: content.slug } },
    orderBy: { viewCount: "desc" },
    take: 3,
  })) as MateriLite[];

  const catLabel = CONTENT_CATEGORY_LABEL[content.category] ?? content.category;

  return (
    <article>
      <AppHeader title={content.title} eyebrow={catLabel} />

      <div className="space-y-4 p-5">
        {/* media */}
        <div className="relative aspect-video overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-brand-dark/15 to-brand/15 [box-shadow:var(--shadow-soft)]">
          {content.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.imageUrl} alt={content.title} className="h-full w-full object-cover" />
          )}
          {content.videoUrl && (
            <a
              href={content.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="press absolute inset-0 grid place-items-center"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-brand-dark shadow-lg">
                <Play size={24} className="ml-1 fill-current" />
              </span>
            </a>
          )}
          {!content.imageUrl && !content.videoUrl && (
            <span className="absolute inset-0 grid place-items-center text-brand-dark/30">
              <BookOpen size={40} />
            </span>
          )}
        </div>

        {/* meta */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Eye size={13} /> {formatViews(content.viewCount)}</span>
          {content.publishedAt && (
            <span className="flex items-center gap-1"><CalendarDays size={13} /> {tanggal(content.publishedAt)}</span>
          )}
        </div>

        {/* ringkasan */}
        <p className="rounded-[var(--radius-card)] bg-brand-soft p-4 text-sm font-medium leading-relaxed text-brand-dark">
          {content.summary}
        </p>

        {/* isi */}
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{content.content}</div>

        {/* tags */}
        {content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {content.tags.map((t) => (
              <span key={t} className="rounded-full bg-brand-tint px-3 py-1 text-[11px] font-medium text-brand-dark">#{t}</span>
            ))}
          </div>
        )}

        {/* CTA quiz */}
        <Link
          href="/belajar/quiz"
          className="press flex items-center gap-3.5 rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft">
            <ClipboardCheck size={22} className="text-brand-600" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-brand-dark">Sudah paham? Uji dengan quiz</p>
            <p className="text-xs text-gray-500">Kerjakan kuis singkat untuk menguji pemahamanmu.</p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-gray-300" />
        </Link>

        {/* terkait */}
        {related.length > 0 && (
          <section>
            <h2 className="mb-3 text-[15px] font-bold tracking-tight text-brand-dark">Materi Terkait</h2>
            <div className="space-y-3">
              {related.map((m) => (
                <MateriRow key={m.slug} m={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
