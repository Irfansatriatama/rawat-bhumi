"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";
import { Card, IconChip } from "@/components/ui/primitives";
import { Button } from "@/components/ui/loading";

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
    <Card className="p-5">
      <form onSubmit={submit}>
        <div className="mb-4 flex items-center gap-3">
          <IconChip icon={Megaphone} tone="teal" size={36} />
          <h2 className="font-semibold text-brand-dark">Buat Pengumuman</h2>
        </div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Judul</label>
        <input className={`${input} mb-3`} placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label className="mb-1 block text-sm font-medium text-gray-700">Isi pengumuman</label>
        <textarea className={`${input} min-h-20`} placeholder="Isi pengumuman" value={body} onChange={(e) => setBody(e.target.value)} required />
        <Button type="submit" loading={loading} className="mt-4">
          Terbitkan
        </Button>
      </form>
    </Card>
  );
}
