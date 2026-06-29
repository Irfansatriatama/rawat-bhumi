import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, CheckCircle2, XCircle, ChevronRight, Home } from "lucide-react";
import { getSessionLike } from "@/lib/session";
import { prisma } from "@/lib/db";
import { JOIN_REQUEST_STATUS } from "@/lib/prisma-enums";

export default async function MenungguPage() {
  const session = await getSessionLike();
  if (!session?.profileId) redirect("/daftar");

  const jr = await prisma.joinRequest.findFirst({
    where: { userId: session.profileId },
    orderBy: { createdAt: "desc" },
    include: { rt: { include: { rw: { include: { kelurahan: true } } } } },
  });

  if (!jr) redirect("/onboarding/komunitas");

  const approved = jr.status === JOIN_REQUEST_STATUS.APPROVED;
  const rejected = jr.status === JOIN_REQUEST_STATUS.REJECTED;
  const wil = `RT ${jr.rt.number} / RW ${jr.rt.rw.number}, ${jr.rt.rw.kelurahan.name}`;

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-brand-tint p-6 text-center">
      <span
        className={`grid h-20 w-20 place-items-center rounded-full ${
          approved ? "bg-brand-soft text-brand-600" : rejected ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-brand-amber"
        }`}
      >
        {approved ? <CheckCircle2 size={40} /> : rejected ? <XCircle size={40} /> : <Clock size={40} />}
      </span>

      <h1 className="mt-5 text-2xl font-bold text-brand-dark">
        {approved ? "Kamu sudah diterima! 🎉" : rejected ? "Pengajuan belum disetujui" : "Menunggu persetujuan"}
      </h1>
      <p className="mt-2 max-w-xs text-sm text-gray-500">
        {approved
          ? `Selamat datang di komunitas ${wil}.`
          : rejected
            ? "Hubungi Ketua RT untuk info lebih lanjut, atau cari komunitas lain."
            : `Pengajuanmu ke ${wil} sedang ditinjau Ketua RT. Kamu akan dapat notifikasi saat disetujui.`}
      </p>

      <div className="mt-8 w-full max-w-sm space-y-2.5">
        {approved ? (
          <Link href="/onboarding/selamat-datang" className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-dark py-3.5 text-sm font-semibold text-white">
            Lihat Komunitasku <ChevronRight size={17} />
          </Link>
        ) : rejected ? (
          <Link href="/onboarding/komunitas" className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-dark py-3.5 text-sm font-semibold text-white">
            Cari Komunitas Lain
          </Link>
        ) : (
          <Link href="/beranda" className="press flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-semibold text-brand-dark ring-1 ring-brand-dark/5">
            <Home size={16} /> Ke Beranda
          </Link>
        )}
      </div>
    </main>
  );
}
