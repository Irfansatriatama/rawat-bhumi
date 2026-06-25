import { Info, Sprout, Recycle, Flame, ShieldAlert, Leaf } from "lucide-react";
import { AppHeader } from "@/components/ui/app-header";
import { Card, IconChip } from "@/components/ui/primitives";

const JALUR = [
  { icon: Sprout, tone: "lime" as const, label: "Organik", desc: "Diolah jadi maggot BSF & kompos" },
  { icon: Recycle, tone: "teal" as const, label: "Anorganik", desc: "Didaur ulang jadi bahan baku" },
  { icon: Flame, tone: "amber" as const, label: "Residu", desc: "Diproses pirolisis bersertifikat" },
  { icon: ShieldAlert, tone: "red" as const, label: "B3", desc: "Ditangani mitra berizin" },
];

export default function TentangPage() {
  return (
    <div>
      <AppHeader title="Tentang Kami" subtitle="Rawat Bhumi" icon={Info} />
      <div className="space-y-4 p-5">
        <Card className="p-5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft">
            <Leaf size={24} className="text-brand-600" />
          </span>
          <h2 className="mt-3 text-base font-bold text-brand-dark">Pilah cerdas, Bhumi lestari</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Rawat Bhumi adalah platform pengelolaan sampah berbasis warga. Kami menghubungkan rumah tangga,
            kurir (Ksatria Bhumi), dan mitra hilir agar setiap sampah terpilah berakhir di jalur yang benar,
            bukan di tempat pembuangan akhir.
          </p>
        </Card>

        <div>
          <h3 className="mb-2.5 px-1 text-sm font-bold text-brand-dark">Empat jalur sampah</h3>
          <div className="grid grid-cols-2 gap-3">
            {JALUR.map((j) => (
              <Card key={j.label} className="p-4">
                <IconChip icon={j.icon} tone={j.tone} size={40} />
                <p className="mt-2.5 text-sm font-semibold text-brand-dark">{j.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{j.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-4">
          <p className="text-sm font-semibold text-brand-dark">Misi kami</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Menjadikan memilah sampah sebagai kebiasaan harian yang mudah, terukur, dan berdampak nyata bagi
            lingkungan serta ekonomi warga.
          </p>
        </Card>

        <p className="px-1 text-center text-[11px] text-gray-400">Rawat Bhumi · Versi 0.1.0 (Pilot)</p>
      </div>
    </div>
  );
}
