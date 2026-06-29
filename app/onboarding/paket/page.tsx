import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PaketPicker } from "@/components/onboarding/paket-picker";

export default async function PilihPaketPage() {
  const session = await getSession();
  if (!session) redirect("/daftar");

  return (
    <main className="min-h-[100dvh] bg-brand-tint">
      <div className="app-header rounded-b-[28px] px-6 pb-8 pt-12 text-white">
        <p className="text-xs font-medium text-brand-lime">Langkah 2 dari 3</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Pilih Paket Layanan</h1>
        <p className="mt-1.5 text-sm text-white/75">Pilih paket yang sesuai kebutuhanmu. Bisa diubah kapan saja.</p>
      </div>
      <div className="p-5">
        <PaketPicker />
      </div>
    </main>
  );
}
