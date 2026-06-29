import Link from "next/link";
import { Award, Leaf, Recycle, Trash2, TriangleAlert, Cloud, Truck, Star, ArrowLeft } from "lucide-react";
import { getSession, getSessionLike } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getCertificate } from "@/lib/certificate";
import { Card, EmptyState } from "@/components/ui/primitives";
import { CertificateActions } from "@/components/akun/certificate-download";

export default async function SertifikatDetailPage({ params }: { params: Promise<{ period: string }> }) {
  const { period } = await params;
  const session = await getSession();
  const like = await getSessionLike();
  const cert = like?.profileId ? await getCertificate(like.profileId, period) : null;

  if (!cert) {
    return (
      <div className="bg-brand-tint p-4">
        <EmptyState
          icon={Award}
          title="Sertifikat tidak ditemukan"
          hint="Belum ada data pickup pada periode ini."
        />
        <Link href="/akun/sertifikat" className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-brand-600">
          <ArrowLeft size={15} /> Kembali ke daftar sertifikat
        </Link>
      </div>
    );
  }

  const profile = like?.profileId
    ? await prisma.userProfile.findUnique({
        where: { id: like.profileId },
        include: { rt: { include: { rw: { include: { kelurahan: true } } } } },
      })
    : null;
  const name = session?.user.name ?? "Warga";
  const wilayah = profile?.rt
    ? `RT ${profile.rt.number}/RW ${profile.rt.rw.number}, ${profile.rt.rw.kelurahan.name}`
    : "Komunitas Rawat Bhumi";

  const cats = [
    { icon: Leaf, label: "Organik", value: cert.organikKg, color: "text-brand-600" },
    { icon: Recycle, label: "Anorganik", value: cert.anorganikKg, color: "text-sky-600" },
    { icon: Trash2, label: "Residu", value: cert.residuKg, color: "text-slate-500" },
    { icon: TriangleAlert, label: "B3", value: cert.b3Kg, color: "text-brand-amber" },
  ];

  return (
    <div className="bg-brand-tint pb-8 print:bg-white">
      {/* topbar non-print */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-brand-dark/5 bg-white/90 px-4 py-3.5 backdrop-blur-lg print:hidden">
        <Link href="/akun/sertifikat" className="press grid h-9 w-9 place-items-center rounded-full bg-brand-tint">
          <ArrowLeft size={18} className="text-brand-dark" />
        </Link>
        <h1 className="text-base font-bold text-brand-dark">Sertifikat {cert.label}</h1>
      </header>

      <div className="space-y-4 p-4">
        {/* ===== KARTU SERTIFIKAT (printable) ===== */}
        <div className="cert-printable overflow-hidden rounded-[var(--radius-card)] border border-brand-dark/10 bg-white [box-shadow:var(--shadow-soft)]">
          {/* pita atas */}
          <div className="app-header relative overflow-hidden px-6 pb-6 pt-7 text-center text-white">
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/emblem.png" alt="Rawat Bhumi" className="mx-auto h-14 w-14" />
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-lime">Sertifikat Dampak Lingkungan</p>
            <h2 className="mt-1 text-lg font-bold">Rawat Bhumi</h2>
          </div>

          <div className="px-6 py-6 text-center">
            <p className="text-xs text-gray-400">Diberikan kepada</p>
            <p className="mt-1 text-2xl font-bold text-brand-dark">{name}</p>
            <p className="mt-1 text-xs text-gray-500">{wilayah}</p>
            <p className="mt-3 text-sm text-gray-600">
              atas kontribusi nyata mengelola sampah secara terpilah sepanjang
            </p>
            <p className="text-base font-bold text-brand-600">{cert.label}</p>

            {/* statistik utama */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <Stat icon={Leaf} value={`${cert.totalKg}`} unit="kg" label="Terkelola" />
              <Stat icon={Cloud} value={`${cert.co2Kg}`} unit="kg" label="CO₂ dicegah" />
              <Stat icon={Truck} value={`${cert.pickupCount}`} unit="×" label="Pickup" />
            </div>

            {/* rincian kategori */}
            <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl bg-brand-tint p-3">
              {cats.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex flex-col items-center">
                    <Icon size={18} className={c.color} />
                    <p className="mt-1 text-[11px] font-bold text-brand-dark">{c.value} kg</p>
                    <p className="text-[9px] text-gray-400">{c.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-brand-600">
              <Star size={13} className="fill-current" />
              <span className="font-semibold">{cert.points} poin terkumpul</span>
            </div>

            <p className="mt-5 border-t border-dashed border-brand-dark/10 pt-4 text-[10px] leading-relaxed text-gray-400">
              Sertifikat ini diterbitkan otomatis oleh Rawat Bhumi berdasarkan data penjemputan
              terverifikasi. Ubah Pola Pikir, Rawat Bhumi Hingga Hilir.
            </p>
          </div>
        </div>

        <CertificateActions title={`Sertifikat Dampak ${cert.label} — ${name}`} />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, unit, label }: { icon: typeof Leaf; value: string; unit: string; label: string }) {
  return (
    <Card className="flex flex-col items-center gap-1 p-3">
      <Icon size={20} className="text-brand-600" />
      <p className="text-lg font-bold leading-none text-brand-dark">
        {value}
        <span className="text-[10px] font-medium text-gray-400">{unit}</span>
      </p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </Card>
  );
}
