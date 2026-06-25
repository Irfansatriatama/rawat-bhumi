import { MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { AppHeader } from "@/components/ui/app-header";
import { Card } from "@/components/ui/primitives";
import { AlamatForm } from "@/components/akun/alamat-form";

export default async function AlamatPage() {
  const session = await getSession();
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session!.user.id },
    include: { rt: { include: { rw: { include: { kelurahan: true } } } } },
  });

  const wilayah = profile?.rt
    ? `RT ${profile.rt.number} / RW ${profile.rt.rw.number}, Kel. ${profile.rt.rw.kelurahan.name}`
    : null;

  return (
    <div>
      <AppHeader title="Alamat Saya" subtitle="Titik penjemputan sampah" icon={MapPin} />
      <div className="space-y-4 p-5">
        {wilayah && (
          <Card className="flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft">
              <MapPin size={20} className="text-brand-600" />
            </span>
            <div>
              <p className="text-[11px] text-gray-400">Wilayah terdaftar</p>
              <p className="text-sm font-semibold text-brand-dark">{wilayah}</p>
            </div>
          </Card>
        )}
        <Card className="p-5">
          <AlamatForm initialAddress={profile?.address ?? ""} />
        </Card>
      </div>
    </div>
  );
}
