"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Users, ChevronRight, Sprout, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/loading";

type RtResult = { id: string; number: string; rw: string; kelurahan: string; kota: string; members: number };

export function KomunitasFinder() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<RtResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [picked, setPicked] = useState<RtResult | null>(null);

  // form ajukan
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await fetch(`/api/rt/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults(await res.json());
      setSearched(true);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  async function ajukan(e: React.FormEvent) {
    e.preventDefault();
    if (!picked) return;
    setError(null);
    if (fullName.trim().length < 2 || address.trim().length < 4) {
      return setError("Nama & alamat wajib diisi.");
    }
    setLoading(true);
    const res = await fetch("/api/join-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rtId: picked.id, fullName: fullName.trim(), address: address.trim(), note }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error ?? "Gagal mengajukan.");
    }
    router.push("/onboarding/menunggu");
    router.refresh();
  }

  // ----- Form ajukan bergabung -----
  if (picked) {
    return (
      <form onSubmit={ajukan} className="space-y-3">
        <button type="button" onClick={() => setPicked(null)} className="flex items-center gap-1 text-sm font-medium text-brand-600">
          <ArrowLeft size={15} /> Ganti komunitas
        </button>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-brand-dark/5">
          <p className="text-xs text-gray-400">Mengajukan ke</p>
          <p className="font-bold text-brand-dark">RT {picked.number} / RW {picked.rw}</p>
          <p className="text-xs text-gray-500">{picked.kelurahan}, {picked.kota}</p>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Lengkap</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Alamat Rumah</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Jl. … No. …"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Catatan (opsional)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="mis. patokan rumah"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </div>
        <Button type="submit" loading={loading} className="w-full py-3 text-base">
          {loading ? "Mengirim…" : "Ajukan Bergabung"}
        </Button>
      </form>
    );
  }

  // ----- Pencarian komunitas -----
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 ring-1 ring-brand-dark/5">
        <Search size={18} className="text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
          placeholder="Cari nomor RT, RW, atau kelurahan"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {results.map((r) => (
        <button key={r.id} onClick={() => setPicked(r)} className="press flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-brand-dark/5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-600">
            <MapPin size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-brand-dark">RT {r.number} / RW {r.rw}</p>
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <span>{r.kelurahan}</span>
              <span className="inline-flex items-center gap-0.5"><Users size={11} /> {r.members}</span>
            </p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-gray-300" />
        </button>
      ))}

      {searched && results.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-dark/15 bg-white/60 p-5 text-center">
          <p className="text-sm font-semibold text-brand-dark">Komunitas tidak ditemukan</p>
          <p className="mt-1 text-xs text-gray-500">Belum ada RT aktif yang cocok. Pilih salah satu:</p>
          <div className="mt-4 space-y-2">
            <Link href="/onboarding/founding" className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-dark py-3 text-sm font-semibold text-white">
              <Sprout size={16} /> Jadi Founding Member RT-ku
            </Link>
            <a href="https://wa.me/628111222333?text=Halo%20Rawat%20Bhumi,%20saya%20ingin%20bergabung" className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-soft py-3 text-sm font-semibold text-brand-600">
              <MessageCircle size={16} /> Hubungi Rawat Bhumi
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
