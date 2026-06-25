"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONTENT_CATEGORY } from "@/lib/prisma-enums";

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
    <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-4 font-semibold text-brand-dark">Tambah Materi Edukasi</h2>
      {msg && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{msg}</p>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className={input} placeholder="Judul" value={f.title} onChange={(e) => up("title", e.target.value)} required />
        <input className={input} placeholder="slug-unik" value={f.slug} onChange={(e) => up("slug", e.target.value)} required />
        <select className={input} value={f.category} onChange={(e) => up("category", e.target.value)}>
          {Object.values(CONTENT_CATEGORY).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input className={input} placeholder="Ringkasan" value={f.summary} onChange={(e) => up("summary", e.target.value)} required />
      </div>
      <textarea className={`${input} mt-3 min-h-28`} placeholder="Isi materi (boleh markdown sederhana)" value={f.content} onChange={(e) => up("content", e.target.value)} required />
      <label className="mt-3 flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" checked={f.isPublished} onChange={(e) => up("isPublished", e.target.checked)} />
        Langsung publish
      </label>
      <button disabled={loading} className="mt-4 rounded-lg bg-brand-dark px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
        {loading ? "Menyimpan…" : "Simpan"}
      </button>
    </form>
  );
}
