import { prisma } from "@/lib/db";
import { tanggal } from "@/lib/format";
import { ContentForm } from "@/components/admin/content-form";
import { ContentPublishToggle } from "@/components/admin/content-publish-toggle";
import { AnnouncementForm } from "@/components/admin/announcement-form";

export default async function ContentPage() {
  const [contents, announcements] = await Promise.all([
    prisma.educationContent.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-dark">Konten & Pengumuman</h1>
        <p className="text-sm text-gray-500">Kelola materi edukasi (tampil di PWA warga) & pengumuman.</p>
      </div>

      <ContentForm />

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 font-semibold text-brand-dark">Materi <span className="text-sm font-normal text-gray-400">({contents.length})</span></h2>
        {contents.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada materi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500"><tr className="border-b border-black/5">
                <th className="py-2 pr-4">Judul</th><th className="py-2 pr-4">Kategori</th>
                <th className="py-2 pr-4">Views</th><th className="py-2 pr-4">Status</th>
              </tr></thead>
              <tbody>
                {contents.map((c) => (
                  <tr key={c.id} className="border-b border-black/5 last:border-0 text-gray-700">
                    <td className="py-2 pr-4 font-medium">{c.title}<span className="ml-2 text-xs text-gray-400">/{c.slug}</span></td>
                    <td className="py-2 pr-4">{c.category}</td>
                    <td className="py-2 pr-4">{c.viewCount}</td>
                    <td className="py-2 pr-4"><ContentPublishToggle id={c.id} isPublished={c.isPublished} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnnouncementForm />

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 font-semibold text-brand-dark">Pengumuman <span className="text-sm font-normal text-gray-400">({announcements.length})</span></h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada pengumuman.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="border-b border-black/5 py-2 last:border-0">
              <p className="text-sm font-medium text-gray-800">{a.title}</p>
              <p className="text-sm text-gray-500">{a.body}</p>
              {a.publishedAt && <p className="text-xs text-gray-400">{tanggal(a.publishedAt)}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
