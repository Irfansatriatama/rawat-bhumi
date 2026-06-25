import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { AppHeader } from "@/components/ui/app-header";
import { EmptyState } from "@/components/ui/primitives";
import { MateriRow, type MateriLite } from "@/components/belajar/belajar-bits";

export default async function CariPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const results = query
    ? ((await prisma.educationContent.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { tags: { has: query.toLowerCase() } },
          ],
        },
        orderBy: { viewCount: "desc" },
        take: 50,
      })) as MateriLite[])
    : [];

  return (
    <div>
      <AppHeader title="Cari Materi" subtitle="Temukan materi, topik, atau kategori" icon={Search} />

      <div className="space-y-4 p-5">
        <form action="/belajar/cari" className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            type="search"
            defaultValue={query}
            autoFocus
            placeholder="Cari materi, topik, atau kategori..."
            className="w-full rounded-2xl border border-brand-dark/8 bg-white py-3.5 pl-11 pr-4 text-sm text-brand-dark placeholder:text-gray-400 outline-none ring-brand-600/20 focus:ring-2"
          />
        </form>

        {!query ? (
          <EmptyState icon={Search} title="Mau belajar apa hari ini?" hint="Ketik kata kunci untuk mencari materi edukasi." />
        ) : results.length === 0 ? (
          <EmptyState icon={Search} title={`Tidak ada hasil untuk "${query}"`} hint="Coba kata kunci lain seperti organik, plastik, atau kompos." />
        ) : (
          <>
            <p className="text-xs text-gray-500">{results.length} materi ditemukan untuk &ldquo;{query}&rdquo;</p>
            <div className="space-y-3">
              {results.map((m) => (
                <MateriRow key={m.slug} m={m} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
