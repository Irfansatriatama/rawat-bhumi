import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-6 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-dark text-brand">
        <span className="text-2xl font-bold">RB</span>
      </div>
      <h1 className="text-3xl font-bold text-brand-dark">Rawat Bhumi</h1>
      <p className="mt-2 max-w-md text-gray-600">
        Ubah Pola Pikir, Rawat Bhumi Hingga Hilir. Platform digital sirkular pengelolaan sampah
        komunitas RT.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-brand-dark px-6 py-2.5 font-medium text-white transition hover:opacity-90"
        >
          Masuk
        </Link>
        <Link
          href="/beranda"
          className="rounded-lg bg-white px-6 py-2.5 font-medium text-brand-dark ring-1 ring-brand-dark/20 transition hover:bg-brand-bg"
        >
          Buka Aplikasi
        </Link>
      </div>
      <p className="mt-10 text-xs text-gray-400">Pilot RT 14 RW 01 · Kel. Jagakarsa, Jakarta Selatan</p>
    </main>
  );
}
