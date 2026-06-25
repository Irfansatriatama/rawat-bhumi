import { prisma } from "@/lib/db";
import { listKsatriaOptions, namesByProfileId } from "@/lib/users";
import { WasteInputForm } from "@/components/admin/waste-input-form";
import { tanggal, kg } from "@/lib/format";

export default async function WasteRecordsPage() {
  const [records, openReqs, ksatriaOptions] = await Promise.all([
    prisma.wasteRecord.findMany({ orderBy: { recordedAt: "desc" }, take: 50 }),
    prisma.pickupRequest.findMany({
      where: { status: { in: ["PENDING", "CONFIRMED", "ON_THE_WAY", "ARRIVED"] } },
      include: { schedule: { include: { rt: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    listKsatriaOptions(),
  ]);

  const profileIds = [...new Set([...records.map((r) => r.userId), ...openReqs.map((r) => r.userId)])];
  const names = await namesByProfileId(profileIds);

  const requestOptions = openReqs.map((r) => ({
    id: r.id,
    label: `${names.get(r.userId) ?? "-"} · RT ${r.schedule.rt.number} · ${tanggal(r.schedule.scheduledDate)} (${r.status})`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-dark">Timbangan</h1>
        <p className="text-sm text-gray-500">Input manual bila Ksatria offline. Poin & CO₂ dihitung otomatis.</p>
      </div>
      <WasteInputForm requestOptions={requestOptions} ksatriaOptions={ksatriaOptions} />

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 font-semibold text-brand-dark">
          Riwayat Timbangan <span className="text-sm font-normal text-gray-400">({records.length})</span>
        </h2>
        {records.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada catatan timbangan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr className="border-b border-black/5">
                  <th className="py-2 pr-3">Tanggal</th>
                  <th className="py-2 pr-3">Warga</th>
                  <th className="py-2 pr-3">Org</th>
                  <th className="py-2 pr-3">Anorg</th>
                  <th className="py-2 pr-3">Residu</th>
                  <th className="py-2 pr-3">B3</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Poin</th>
                  <th className="py-2 pr-3">CO₂</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-black/5 last:border-0 text-gray-700">
                    <td className="py-2 pr-3">{tanggal(r.recordedAt)}</td>
                    <td className="py-2 pr-3">{names.get(r.userId) ?? "-"}</td>
                    <td className="py-2 pr-3">{r.organikGrams}</td>
                    <td className="py-2 pr-3">{r.anorganikGrams}</td>
                    <td className="py-2 pr-3">{r.residuGrams}</td>
                    <td className="py-2 pr-3">{r.b3Grams}</td>
                    <td className="py-2 pr-3 font-medium">{kg(r.totalGrams)} kg</td>
                    <td className="py-2 pr-3 text-brand-dark">+{r.pointsEarned}</td>
                    <td className="py-2 pr-3">{r.co2ReducedKg.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
