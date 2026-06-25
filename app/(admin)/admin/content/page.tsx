import { BookOpen, Megaphone } from "lucide-react";
import { prisma } from "@/lib/db";
import { tanggal } from "@/lib/format";
import { Card, PageHeading, StatusBadge, EmptyState } from "@/components/ui/primitives";
import { ContentForm } from "@/components/admin/content-form";
import { ContentPublishToggle } from "@/components/admin/content-publish-toggle";
import { AnnouncementForm } from "@/components/admin/announcement-form";

export default async function ContentPage() {
  const [contents, announcements] = await Promise.all([
    prisma.educationContent.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div>
      <PageHeading
        title="Konten & Pengumuman"
        subtitle="Kelola materi edukasi (tampil di PWA warga) & pengumuman."
      />

      <ContentForm />

      <Card className="mt-4 overflow-hidden">
        <div className="px-5 pt-5">
          <h2 className="font-semibold text-brand-dark">
            Materi <span className="text-sm font-normal text-gray-400">({contents.length})</span>
          </h2>
        </div>
        {contents.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={BookOpen} title="Belum ada materi" hint="Tambahkan materi edukasi melalui formulir di atas." />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-brand-dark/5 text-left text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Judul</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Views</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((c) => (
                  <tr key={c.id} className="border-b border-brand-dark/5 last:border-0">
                    <td className="px-4 py-3 font-medium text-brand-dark">
                      {c.title}
                      <span className="ml-2 text-xs font-normal text-gray-400">/{c.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{c.category}</td>
                    <td className="px-4 py-3 text-gray-700">{c.viewCount}</td>
                    <td className="px-4 py-3">
                      <ContentPublishToggle id={c.id} isPublished={c.isPublished} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-4">
        <AnnouncementForm />
      </div>

      <Card className="mt-4 p-5">
        <h2 className="mb-3 font-semibold text-brand-dark">
          Pengumuman <span className="text-sm font-normal text-gray-400">({announcements.length})</span>
        </h2>
        {announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="Belum ada pengumuman" hint="Buat pengumuman melalui formulir di atas." />
        ) : (
          <div>
            {announcements.map((a) => (
              <div key={a.id} className="border-b border-brand-dark/5 py-3 last:border-0">
                <p className="text-sm font-medium text-brand-dark">{a.title}</p>
                <p className="text-sm text-gray-500">{a.body}</p>
                {a.publishedAt && <p className="mt-1 text-xs text-gray-400">{tanggal(a.publishedAt)}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
