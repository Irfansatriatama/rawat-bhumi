"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { authClient, signIn } from "@/lib/auth-client";
import { homeForRole } from "@/lib/roles";
import { Button } from "@/components/ui/loading";
import { LogoMark } from "@/components/brand/logo-mark";
import { HeroIllustration } from "@/components/brand/hero-illustration";
import { FeaturePills } from "@/components/brand/feature-pills";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn.email({ email, password });
    if (error) {
      setError(error.message ?? "Login gagal");
      setLoading(false);
      return;
    }
    // Tentukan tujuan: ?redirect=... atau beranda sesuai role
    const redirectParam = new URLSearchParams(window.location.search).get("redirect");
    const session = await authClient.getSession();
    const role = (session.data?.user as { role?: string } | undefined)?.role ?? "WARGA";
    router.push(redirectParam || homeForRole(role));
    router.refresh();
  }

  return (
    <main className="flex min-h-[100dvh] bg-brand-tint">
      {/* ===== Panel brand — selaras dengan splash (tampil di layar lebar) ===== */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-deep p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-brand/10" />

        <div className="relative flex items-center gap-3">
          <LogoMark size={48} />
          <div>
            <p className="text-xl font-bold leading-tight">Rawat Bhumi</p>
            <p className="text-sm text-white/60">Ubah pola pikir, rawat bumi hingga hilir</p>
          </div>
        </div>

        <div className="relative my-6 overflow-hidden rounded-[var(--radius-card)]">
          <HeroIllustration />
        </div>

        <div className="relative">
          <FeaturePills />
          <p className="mt-6 text-center text-xs text-white/50">
            Platform digital sirkular pengelolaan sampah komunitas RT.
          </p>
        </div>
      </aside>

      {/* ===== Sisi form ===== */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Header eco untuk mobile (selaras dengan header aplikasi) */}
        <div className="app-header relative overflow-hidden rounded-b-[28px] px-6 pb-9 pt-12 text-center text-white lg:hidden">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-brand/10" />
          <button
            onClick={() => router.push("/")}
            className="press absolute left-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/15 ring-1 ring-white/20"
            aria-label="Kembali"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="relative flex flex-col items-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <LogoMark size={44} />
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">Selamat datang</h1>
            <p className="mt-1 text-sm text-white/70">Masuk untuk melanjutkan</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <form onSubmit={onSubmit} className="w-full max-w-sm">
            {/* Judul untuk layar lebar (di mobile sudah ada di header) */}
            <div className="mb-7 hidden lg:block">
              <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Selamat datang kembali</h1>
              <p className="mt-1 text-sm text-gray-500">Masuk ke akun Rawat Bhumi kamu</p>
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{error}</p>
            )}

            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="admin@rawatbhumi.id"
            />

            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-6 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="••••••••"
            />

            <Button type="submit" loading={loading} className="w-full py-3 text-base">
              {loading ? "Memproses…" : "Masuk"}
            </Button>

            <p className="mt-6 text-center text-xs text-gray-400">
              Pilot RT 14 RW 01 · Kel. Jagakarsa, Jakarta Selatan
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
