import { Scale } from "lucide-react";
import { prisma } from "@/lib/db";
import { listKsatriaOptions, namesByProfileId } from "@/lib/users";
import { WasteInputForm } from "@/components/admin/waste-input-form";
import { tanggal, kg } from "@/lib/format";
import { Card, PageHeading, SectionTitle, EmptyState } from "@/components/ui/primitives";

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
    <div>
      <PageHeading
        title="Timbangan"
        subtitle="Input manual bila Ksatria offline. Poin & CO₂ dihitung otomatis."
      />

      <div className="space-y-6">
        <WasteInputForm requestOptions={requestOptions} ksatriaOptions={ksatriaOptions} />

        <div>
          <SectionTitle>
            Riwayat Timbangan <span className="font-normal text-gray-400">({records.length})</span>
          </SectionTitle>
          {records.length === 0 ? (
            <EmptyState
              icon={Scale}
              title="Belum ada catatan timbangan"
              hint="Catatan timbangan akan muncul di sini setelah input manual atau dari Ksatria."
            />
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-brand-dark/5 text-left text-xs uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tanggal</th>
                      <th className="px-4 py-3 font-medium">Warga</th>
                      <th className="px-4 py-3 font-medium">Org</th>
                      <th className="px-4 py-3 font-medium">Anorg</th>
                      <th className="px-4 py-3 font-medium">Residu</th>
                      <th className="px-4 py-3 font-medium">B3</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Poin</th>
                      <th className="px-4 py-3 font-medium">CO₂</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id} className="border-b border-brand-dark/5 last:border-0">
                        <td className="px-4 py-3 text-brand-dark">{tanggal(r.recordedAt)}</td>
                        <td className="px-4 py-3 text-gray-500">{names.get(r.userId) ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-500">{r.organikGrams}</td>
                        <td className="px-4 py-3 text-gray-500">{r.anorganikGrams}</td>
                        <td className="px-4 py-3 text-gray-500">{r.residuGrams}</td>
                        <td className="px-4 py-3 text-gray-500">{r.b3Grams}</td>
                        <td className="px-4 py-3 font-medium text-brand-dark">{kg(r.totalGrams)} kg</td>
                        <td className="px-4 py-3 font-medium text-brand-600">+{r.pointsEarned}</td>
                        <td className="px-4 py-3 text-gray-500">{r.co2ReducedKg.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
