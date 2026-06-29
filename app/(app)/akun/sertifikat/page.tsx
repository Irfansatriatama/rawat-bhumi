import Link from "next/link";
import { Award, ChevronRight, Leaf, Cloud, Truck, Sparkles } from "lucide-react";
import { getSessionLike } from "@/lib/session";
import { listCertificates } from "@/lib/certificate";
import { AppHeader } from "@/components/ui/app-header";
import { Card, EmptyState } from "@/components/ui/primitives";

export default async function SertifikatPage() {
  const like = await getSessionLike();
  const certs = like?.profileId ? await listCertificates(like.profileId) : [];

  return (
    <div className="bg-brand-tint pb-6">
      <AppHeader
        title="Sertifikat Dampak"
        subtitle="Bukti kontribusimu, terbit tiap akhir bulan"
        icon={Award}
      />

      <div className="space-y-3 p-4">
        {certs.length === 0 ? (
          <EmptyState
            icon={Award}
            title="Sertifikat belum terbit"
            hint="Sertifikat dampakmu akan terbit di akhir bulan pertama setelah pickup. Terus pilah, ya!"
          />
        ) : (
          certs.map((c) => (
            <Link key={c.period} href={`/akun/sertifikat/${c.period}`}>
              <Card className="press flex items-center gap-3.5 p-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-dark text-white">
                  <Award size={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-brand-dark">{c.label}</p>
                    {c.isCurrent && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-brand-amber">
                        Berjalan
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><Leaf size={12} className="text-brand-600" /> {c.totalKg} kg</span>
                    <span className="inline-flex items-center gap-1"><Cloud size={12} className="text-brand-dark" /> {c.co2Kg} kg CO₂</span>
                    <span className="inline-flex items-center gap-1"><Truck size={12} className="text-gray-400" /> {c.pickupCount}× pickup</span>
                  </p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-gray-300" />
              </Card>
            </Link>
          ))
        )}

        <p className="flex items-center gap-2 px-1 pt-1 text-[11px] text-gray-400">
          <Sparkles size={13} className="shrink-0 text-brand-600" />
          Sertifikat dihitung otomatis dari data pickup terverifikasi Ksatria.
        </p>
      </div>
    </div>
  );
}
