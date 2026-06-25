"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, signIn } from "@/lib/auth-client";
import { homeForRole } from "@/lib/roles";

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
    <main className="flex min-h-screen items-center justify-center bg-brand-bg p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-brand-dark text-brand">
            <span className="text-lg font-bold">RB</span>
          </div>
          <h1 className="text-xl font-semibold text-brand-dark">Rawat Bhumi</h1>
          <p className="text-sm text-gray-500">Masuk ke akun kamu</p>
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
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
          placeholder="admin@rawatbhumi.id"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-dark py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>
    </main>
  );
}
