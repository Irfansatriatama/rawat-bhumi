import Link from "next/link";
import { Users, MapPin, UserCog, Info, MessageCircle, ChevronRight } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { USER_ROLE } from "@/lib/prisma-enums";
import { AppHeader } from "@/components/ui/app-header";
import { Card, EmptyState } from "@/components/ui/primitives";

export default async function KomunitasSayaPage() {
  const session = await getSession();
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session!.user.id },
    include: { rt: { include: { rw: { include: { kelurahan: true } } } } },
  });

  const ketua = profile?.rtId
    ? await prisma.userProfile.findFirst({ where: { rtId: profile.rtId, role: USER_ROLE.ADMIN_RT } })
    : null;
  const ketuaUser = ketua ? await prisma.user.findUnique({ where: { id: ketua.userId }, select: { name: true } }) : null;
  const count = profile?.rtId ? await prisma.userProfile.count({ where: { rtId: profile.rtId } }) : 0;

  return (
    <div className="bg-brand-tint pb-6">
      <AppHeader title="Komunitas Saya" subtitle="RT tempatmu terdaftar" icon={Users} />
      <div className="space-y-3 p-4">
        {!profile?.rt ? (
          <>
            <EmptyState icon={Users} title="Belum tergabung komunitas" hint="Cari dan ajukan bergabung ke RT-mu." />
            <Link href="/onboarding/komunitas" className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-dark py-3.5 text-sm font-semibold text-white">
              Cari Komunitas
            </Link>
          </>
        ) : (
          <>
            <Card className="divide-y divide-brand-dark/5 p-4">
              {[
                { icon: MapPin, label: "Wilayah", value: `RT ${profile.rt.number} / RW ${profile.rt.rw.number}, ${profile.rt.rw.kelurahan.name}` },
                { icon: UserCog, label: "Ketua RT", value: ketuaUser?.name ?? "Pengurus RT" },
                { icon: Users, label: "Jumlah anggota", value: `${count} warga` },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.label} className="flex items-center gap-3 py-2.5">
                    <Icon size={17} className="shrink-0 text-brand-dark/70" />
                    <span className="flex-1 text-xs text-gray-400">{r.label}</span>
                    <span className="text-right text-sm font-medium text-brand-dark">{r.value}</span>
                  </div>
                );
              })}
            </Card>

            <Link href="/komunitas/anggota" className="press flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-brand-dark/5">
              <Users size={18} className="text-brand-600" />
              <span className="flex-1 text-sm font-medium text-brand-dark">Lihat daftar anggota</span>
              <ChevronRight size={17} className="text-gray-300" />
            </Link>

            <div className="flex items-start gap-2 rounded-2xl bg-brand-soft/50 p-3.5">
              <Info size={15} className="mt-0.5 shrink-0 text-brand-600" />
              <p className="text-xs text-gray-600">
                Ingin pindah komunitas? Perpindahan perlu persetujuan operator. Hubungi kami via WhatsApp.
              </p>
            </div>
            <a href="https://wa.me/628111222333?text=Halo,%20saya%20ingin%20pindah%20komunitas" className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-soft py-3 text-sm font-semibold text-brand-600">
              <MessageCircle size={16} /> Hubungi Operator
            </a>
          </>
        )}
      </div>
    </div>
  );
}
