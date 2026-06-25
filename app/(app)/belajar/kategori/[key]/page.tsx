import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/db";
import { AppHeader } from "@/components/ui/app-header";
import { EmptyState } from "@/components/ui/primitives";
import { categoryByKey } from "@/lib/belajar";
import { MateriRow, type MateriLite } from "@/components/belajar/belajar-bits";

export default async function KategoriDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const cat = categoryByKey(key);
  if (!cat) notFound();

  const materi = (await prisma.educationContent.findMany({
    where: { isPublished: true, category: { in: cat.cats } },
    orderBy: { publishedAt: "desc" },
    take: 100,
  })) as MateriLite[];

  return (
    <div>
      <AppHeader title={cat.label} subtitle={`${materi.length} materi tersedia`} icon={cat.icon} />

      <div className="space-y-3 p-5">
        {materi.length === 0 ? (
          <EmptyState icon={BookOpen} title="Belum ada materi" hint="Materi untuk kategori ini akan tampil setelah diterbitkan." />
        ) : (
          materi.map((m) => <MateriRow key={m.slug} m={m} />)
        )}
      </div>
    </div>
  );
}
