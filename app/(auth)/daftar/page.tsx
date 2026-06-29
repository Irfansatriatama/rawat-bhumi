"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { normalizePhone, displayPhone } from "@/lib/phone";
import { Button } from "@/components/ui/loading";
import { LogoTile } from "@/components/brand/logo-mark";

export default function DaftarPage() {
  return (
    <Suspense>
      <DaftarForm />
    </Suspense>
  );
}

function DaftarForm() {
  const router = useRouter();
  const ref = useSearchParams().get("ref") ?? "";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError("Nama lengkap wajib diisi.");
    const norm = normalizePhone(phone);
    if (norm.length < 11) return setError("Nomor HP tidak valid.");
    setLoading(true);
    const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber: norm });
    setLoading(false);
    if (error) return setError(error.message ?? "Gagal mengirim OTP.");
    const qs = new URLSearchParams({ phone: norm, name: name.trim(), ...(ref ? { ref } : {}) });
    router.push(`/daftar/otp?${qs.toString()}`);
  }

  return (
    <main className="flex min-h-[100dvh] flex-col bg-brand-tint">
      <div className="app-header relative overflow-hidden rounded-b-[28px] px-6 pb-9 pt-12 text-center text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <Link href="/" className="press absolute left-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
          <ArrowLeft size={18} />
        </Link>
        <div className="relative flex flex-col items-center">
          <LogoTile size={64} pad={10} />
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Daftar Penjaga Bhumi</h1>
          <p className="mt-1 text-sm text-white/70">Mulai kelola sampah bersama komunitasmu</p>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          {ref && (
            <p className="mb-4 rounded-lg bg-brand-soft px-3 py-2 text-xs text-brand-600">
              Kamu diundang bergabung (kode: <b>{ref}</b>).
            </p>
          )}
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{error}</p>}

          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Lengkap</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="mis. Sari Wulandari"
            className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />

          <label className="mb-1 block text-sm font-medium text-gray-700">Nomor HP</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            required
            placeholder="08xxxxxxxxxx"
            className="mb-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          {phone && <p className="mb-5 text-xs text-gray-400">Akan dikirim ke {displayPhone(normalizePhone(phone))}</p>}

          <Button type="submit" loading={loading} className="mt-2 w-full py-3 text-base">
            {loading ? "Mengirim kode…" : "Kirim Kode OTP"}
          </Button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-brand-600">Masuk</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
