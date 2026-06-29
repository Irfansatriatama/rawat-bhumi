import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { KomunitasFinder } from "@/components/onboarding/komunitas-finder";

export default async function CariKomunitasPage() {
  const session = await getSession();
  if (!session) redirect("/daftar");

  return (
    <main className="min-h-[100dvh] bg-brand-tint">
      <div className="app-header rounded-b-[28px] px-6 pb-8 pt-12 text-white">
        <p className="text-xs font-medium text-brand-lime">Langkah terakhir</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Cari Komunitasmu</h1>
        <p className="mt-1.5 text-sm text-white/75">
          Temukan RT-mu lalu ajukan bergabung. Ketua RT akan menyetujui keanggotaanmu.
        </p>
      </div>
      <div className="p-5">
        <KomunitasFinder />
      </div>
    </main>
  );
}
