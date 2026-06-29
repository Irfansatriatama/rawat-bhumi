"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/loading";

export function FoundingForm() {
  const router = useRouter();
  const [f, setF] = useState({ kelurahan: "", kota: "Jakarta Selatan", rw: "", rt: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!f.kelurahan.trim() || !f.rw.trim() || !f.rt.trim()) {
      return setError("Kelurahan, RW, dan RT wajib diisi.");
    }
    setLoading(true);
    const res = await fetch("/api/onboarding/founding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error ?? "Gagal mendaftar.");
    }
    router.push("/beranda");
    router.refresh();
  }

  const field = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{error}</p>}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Kelurahan</label>
        <input value={f.kelurahan} onChange={set("kelurahan")} required placeholder="mis. Jagakarsa" className={field} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Kota</label>
        <input value={f.kota} onChange={set("kota")} className={field} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">RW</label>
          <input value={f.rw} onChange={set("rw")} required inputMode="numeric" placeholder="01" className={field} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">RT</label>
          <input value={f.rt} onChange={set("rt")} required inputMode="numeric" placeholder="14" className={field} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Alamat Rumah</label>
        <input value={f.address} onChange={set("address")} placeholder="Jl. … No. …" className={field} />
      </div>
      <Button type="submit" loading={loading} className="w-full py-3 text-base">
        {loading ? "Mendaftar…" : "Daftarkan Wilayahku"}
      </Button>
    </form>
  );
}
