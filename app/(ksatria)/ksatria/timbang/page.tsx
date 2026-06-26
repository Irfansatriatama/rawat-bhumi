import { CheckCircle2 } from "lucide-react";
import { getKsatriaProfile, openRequestsForKsatria, weighedTodayByKsatria } from "@/lib/ksatria";
import { namesByProfileId } from "@/lib/users";
import { tanggal } from "@/lib/format";
import { KsatriaWeighForm } from "@/components/ksatria/weigh-form";
import { Card, SectionTitle, IconChip } from "@/components/ui/primitives";

function gr(g: number): string {
  return g >= 1000 ? `${(g / 1000).toFixed(1)} kg` : `${g} g`;
}

export default async function TimbangPage() {
  const kp = await getKsatriaProfile();
  if (!kp) return <p className="text-sm text-gray-500">Bukan akun Ksatria.</p>;

  const [reqs, weighedToday] = await Promise.all([
    openRequestsForKsatria(kp.id),
    weighedTodayByKsatria(kp.id),
  ]);
  const names = await namesByProfileId(reqs.map((r) => r.userId));
  const options = reqs.map((r) => ({
    id: r.id,
    label: `${names.get(r.userId) ?? "-"} · RT ${r.schedule.rt.number} · ${tanggal(r.schedule.scheduledDate)}`,
  }));

  return (
    <div className="space-y-5 p-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-brand-dark">Input Timbangan</h2>
        <p className="text-sm text-gray-500">Catat berat sampah per kategori untuk tiap KK.</p>
      </div>
      <KsatriaWeighForm requestOptions={options} />

      {weighedToday.length > 0 && (
        <section>
          <SectionTitle>
            Sudah ditimbang hari ini <span className="font-normal text-gray-400">({weighedToday.length})</span>
          </SectionTitle>
          <div className="space-y-2.5">
            {weighedToday.map((w) => (
              <Card key={w.id} className="flex items-center gap-3 p-3.5">
                <IconChip icon={CheckCircle2} tone="green" size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-dark">{w.name}</p>
                  <p className="text-xs text-gray-500">{new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(w.recordedAt)} WIB</p>
                </div>
                <span className="text-sm font-bold text-brand-dark">{gr(w.totalGrams)}</span>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
