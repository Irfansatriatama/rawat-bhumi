import { prisma } from "@/lib/db";
import { USER_ROLE } from "@/lib/prisma-enums";

function startOfWeek(): Date {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Senin = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function Kpi({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-brand-dark">
        {value}
        {unit && <span className="ml-1 text-base font-normal text-gray-400">{unit}</span>}
      </p>
    </div>
  );
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
      <h1 className="mb-1 text-2xl font-semibold text-brand-dark">Dashboard</h1>
      <p className="mb-6 text-sm text-gray-500">Ringkasan pilot RT 14 RW 01 Jagakarsa</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="KK terdaftar (target 150)" value={String(rtAgg._sum.totalKK ?? 0)} unit="KK" />
        <Kpi label="Warga aktif" value={String(wargaCount)} unit="org" />
        <Kpi label="Sampah minggu ini" value={kgMingguIni} unit="kg" />
        <Kpi label="CO₂ dikurangi (total)" value={co2Total} unit="kg" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Kpi label="Pickup selesai (total)" value={String(pickupCount)} />
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 lg:col-span-2">
          <p className="text-sm font-medium text-gray-700">Catatan</p>
          <p className="mt-2 text-sm text-gray-500">
            Data masih kosong — modul pickup, timbangan, dan hilir akan mengisi angka di atas
            (Fase 1+). Chart & tabel menyusul.
          </p>
        </div>
      </div>
    </div>
  );
}
