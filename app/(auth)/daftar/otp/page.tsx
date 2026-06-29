"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { displayPhone } from "@/lib/phone";
import { Button } from "@/components/ui/loading";

export default function OtpPage() {
  return (
    <Suspense>
      <OtpForm />
    </Suspense>
  );
}

function OtpForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const phone = sp.get("phone") ?? "";
  const name = sp.get("name") ?? "";
  const ref = sp.get("ref") ?? "";
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  // Dev mode: tampilkan kode di layar (tanpa SMS). setState async di .then → aman.
  useEffect(() => {
    if (!phone) return;
    fetch(`/api/onboarding/otp-code?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((d) => d?.devMode && d.code && setDevCode(d.code))
      .catch(() => {});
  }, [phone]);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.trim().length < 4) return setError("Masukkan kode OTP.");
    setLoading(true);
    const { error } = await authClient.phoneNumber.verify({ phoneNumber: phone, code: code.trim() });
    if (error) {
      setLoading(false);
      return setError(error.message ?? "Kode salah atau kedaluwarsa.");
    }
    // Lengkapi nama + referral, lalu lanjut cari komunitas.
    await fetch("/api/onboarding/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ref }),
    }).catch(() => {});
    router.push("/onboarding/paket");
    router.refresh();
  }

  async function resend() {
    setError(null);
    const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber: phone });
    if (error) return setError(error.message ?? "Gagal kirim ulang.");
    setResent(true);
    fetch(`/api/onboarding/otp-code?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((d) => d?.code && setDevCode(d.code))
      .catch(() => {});
  }

  return (
    <main className="flex min-h-[100dvh] flex-col bg-brand-tint">
      <div className="app-header relative overflow-hidden rounded-b-[28px] px-6 pb-9 pt-12 text-center text-white">
        <Link href="/daftar" className="press absolute left-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
          <ArrowLeft size={18} />
        </Link>
        <div className="relative flex flex-col items-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <ShieldCheck size={30} />
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Verifikasi OTP</h1>
          <p className="mt-1 text-sm text-white/70">Kode 6 digit dikirim ke {displayPhone(phone)}</p>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center p-6">
        <form onSubmit={verify} className="w-full max-w-sm">
          {devCode && (
            <p className="mb-4 rounded-lg border border-dashed border-brand/40 bg-brand-soft px-3 py-2.5 text-center text-sm text-brand-600">
              Mode uji (tanpa SMS) — kode kamu: <b className="tracking-[0.3em]">{devCode}</b>
            </p>
          )}
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{error}</p>}

          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            inputMode="numeric"
            autoFocus
            placeholder="••••••"
            className="mb-5 w-full rounded-xl border border-gray-300 bg-white py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />

          <Button type="submit" loading={loading} className="w-full py-3 text-base">
            {loading ? "Memverifikasi…" : "Verifikasi & Lanjut"}
          </Button>

          <button type="button" onClick={resend} className="mt-5 w-full text-center text-sm font-medium text-brand-600">
            {resent ? "Kode dikirim ulang" : "Kirim ulang kode"}
          </button>
        </form>
      </div>
    </main>
  );
}
