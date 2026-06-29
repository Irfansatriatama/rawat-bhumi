import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { FoundingForm } from "@/components/onboarding/founding-form";

export default async function FoundingPage() {
  const session = await getSession();
  if (!session) redirect("/daftar");

  return (
    <main className="min-h-[100dvh] bg-brand-tint">
      <div className="app-header rounded-b-[28px] px-6 pb-8 pt-12 text-white">
        <p className="text-xs font-medium text-brand-lime">🌱 Founding Member</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Jadi Pelopor di RT-mu</h1>
        <p className="mt-1.5 text-sm text-white/75">
          Kamu yang pertama! Daftarkan wilayahmu dan ajak tetangga. Saat target KK tercapai,
          Ketua RT mengaktifkan layanan penjemputan.
        </p>
      </div>
      <div className="p-5">
        <FoundingForm />
      </div>
    </main>
  );
}
