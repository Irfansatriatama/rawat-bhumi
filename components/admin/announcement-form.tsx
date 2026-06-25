"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AnnouncementForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const input = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    setLoading(false);
    if (res.ok) {
      setTitle("");
      setBody("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-4 font-semibold text-brand-dark">Buat Pengumuman</h2>
      <input className={`${input} mb-3`} placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea className={`${input} min-h-20`} placeholder="Isi pengumuman" value={body} onChange={(e) => setBody(e.target.value)} required />
      <button disabled={loading} className="mt-4 rounded-lg bg-brand-dark px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
        {loading ? "…" : "Terbitkan"}
      </button>
    </form>
  );
}
