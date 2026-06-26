import { getKsatriaProfile, routeStopsForKsatria } from "@/lib/ksatria";
import { TugasList } from "@/components/ksatria/tugas-list";

export default async function TugasPage() {
  const kp = await getKsatriaProfile();
  if (!kp) return <p className="p-4 text-sm text-gray-500">Bukan akun Ksatria.</p>;

  const stops = await routeStopsForKsatria(kp.id);
  const tasks = stops.map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    rt: s.rt,
    date: s.date,
    status: s.status,
  }));

  return (
    <div className="space-y-5 p-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-brand-dark">Daftar Tugas</h2>
          <p className="text-sm text-gray-500">Rumah yang perlu kamu jemput. Ketuk untuk detail.</p>
        </div>
        {tasks.length > 0 && (
          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-600">{tasks.length} tugas</span>
        )}
      </div>

      <TugasList tasks={tasks} />
    </div>
  );
}
