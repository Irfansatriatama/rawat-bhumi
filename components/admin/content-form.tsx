"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { CONTENT_CATEGORY } from "@/lib/prisma-enums";
import { Card, IconChip } from "@/components/ui/primitives";
import { Button } from "@/components/ui/loading";

const empty = { title: "", slug: "", category: CONTENT_CATEGORY.PILAH_SAMPAH as string, summary: "", content: "", isPublished: true };

export function ContentForm() {
  const router = useRouter();
  const [f, setF] = useState(empty);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const up = (k: keyof typeof empty, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));
  const input = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(d.error ?? "Gagal");
    setF(empty);
    router.refresh();
  }

  return (
    <Card className="p-5">
      <form onSubmit={submit}>
        <div className="mb-4 flex items-center gap-3">
          <IconChip icon={BookOpen} tone="green" size={36} />
          <h2 className="font-semibold text-brand-dark">Tambah Materi Edukasi</h2>
        </div>
        {msg && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{msg}</p>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Judul</label>
            <input className={input} placeholder="Judul" value={f.title} onChange={(e) => up("title", e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
            <input className={input} placeholder="slug-unik" value={f.slug} onChange={(e) => up("slug", e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
            <select className={input} value={f.category} onChange={(e) => up("category", e.target.value)}>
              {Object.values(CONTENT_CATEGORY).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ringkasan</label>
            <input className={input} placeholder="Ringkasan" value={f.summary} onChange={(e) => up("summary", e.target.value)} required />
          </div>
        </div>
        <label className="mb-1 mt-3 block text-sm font-medium text-gray-700">Isi materi</label>
        <textarea className={`${input} min-h-28`} placeholder="Isi materi (boleh markdown sederhana)" value={f.content} onChange={(e) => up("content", e.target.value)} required />
        <label className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={f.isPublished} onChange={(e) => up("isPublished", e.target.checked)} />
          Langsung publish
        </label>
        <Button type="submit" loading={loading} className="mt-4">
          Simpan
        </Button>
      </form>
    </Card>
  );
}
