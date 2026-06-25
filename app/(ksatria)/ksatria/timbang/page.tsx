import { getKsatriaProfile, openRequestsForKsatria } from "@/lib/ksatria";
import { namesByProfileId } from "@/lib/users";
import { tanggal } from "@/lib/format";
import { KsatriaWeighForm } from "@/components/ksatria/weigh-form";

export default async function TimbangPage() {
  const kp = await getKsatriaProfile();
  if (!kp) return <p className="text-sm text-gray-500">Bukan akun Ksatria.</p>;

  const reqs = await openRequestsForKsatria(kp.id);
  const names = await namesByProfileId(reqs.map((r) => r.userId));
  const options = reqs.map((r) => ({
    id: r.id,
    label: `${names.get(r.userId) ?? "-"} · RT ${r.schedule.rt.number} · ${tanggal(r.schedule.scheduledDate)}`,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-brand-dark">Input Timbangan</h1>
      <KsatriaWeighForm requestOptions={options} />
    </div>
  );
}
