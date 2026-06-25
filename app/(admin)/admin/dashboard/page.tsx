import { Users, UserCheck, Scale, Cloud, Truck, Info } from "lucide-react";
import { prisma } from "@/lib/db";
import { USER_ROLE } from "@/lib/prisma-enums";
import { Card, StatCard, PageHeading } from "@/components/ui/primitives";

function startOfWeek(): Date {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Senin = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export default async function AdminDashboard() {
  const [wargaCount, rtAgg, weekAgg, co2Agg, pickupCount] = await Promise.all([
    prisma.userProfile.count({ where: { role: USER_ROLE.WARGA } }),
    prisma.rT.aggregate({ _sum: { totalKK: true } }),
    prisma.wasteRecord.aggregate({
      _sum: { totalGrams: true },
      where: { recordedAt: { gte: startOfWeek() } },
    }),
    prisma.wasteRecord.aggregate({ _sum: { co2ReducedKg: true } }),
    prisma.pickupRequest.count({ where: { status: "COMPLETED" } }),
  ]);

  const kgMingguIni = ((weekAgg._sum.totalGrams ?? 0) / 1000).toFixed(1);
  const co2Total = (co2Agg._sum.co2ReducedKg ?? 0).toFixed(1);

  return (
    <div>
      <PageHeading title="Dashboard" subtitle="Ringkasan pilot RT 14 RW 01 Jagakarsa" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} tone="teal" value={String(rtAgg._sum.totalKK ?? 0)} suffix="KK" label="KK terdaftar (target 150)" />
        <StatCard icon={UserCheck} tone="green" value={String(wargaCount)} suffix="org" label="Warga aktif" />
        <StatCard icon={Scale} tone="lime" value={kgMingguIni} suffix="kg" label="Sampah minggu ini" />
        <StatCard icon={Cloud} tone="amber" value={co2Total} suffix="kg" label="CO₂ dikurangi (total)" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard icon={Truck} tone="teal" value={String(pickupCount)} label="Pickup selesai (total)" />
        <Card className="p-5 lg:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <Info size={15} className="text-brand-600" />
            <p className="text-sm font-semibold text-brand-dark">Catatan</p>
          </div>
          <p className="text-sm leading-relaxed text-gray-500">
            Data masih kosong — modul pickup, timbangan, dan hilir akan mengisi angka di atas
            (Fase 1+). Chart &amp; tabel menyusul.
          </p>
        </Card>
      </div>
    </div>
  );
}
