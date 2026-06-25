import { Leaf, CalendarDays, Activity, Zap, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Leaf, title: "Praktis", desc: "Kelola sampah secara mudah" },
  { icon: CalendarDays, title: "Konsisten", desc: "Jadwalkan pickup secara rutin" },
  { icon: Activity, title: "Terukur", desc: "Pantau dampak secara real-time" },
  { icon: Zap, title: "Efisien", desc: "Dukung lingkungan dengan efisien" },
  { icon: ShieldCheck, title: "Akuntabel", desc: "Transparan dan bertanggung jawab" },
];

/**
 * Lima nilai inti Rawat Bhumi sebagai deret pill ikon hijau —
 * mengikuti baris fitur pada referensi splash. Teks di atas latar gelap.
 */
export function FeaturePills({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-5 gap-1.5 ${className}`}>
      {FEATURES.map(({ icon: Icon, title, desc }) => (
        <li key={title} className="flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-white [box-shadow:var(--shadow-pop)]">
            <Icon size={20} strokeWidth={2.1} />
          </span>
          <span className="mt-1.5 text-[11px] font-semibold text-white">{title}</span>
          <span className="mt-0.5 text-[9px] leading-tight text-white/65">{desc}</span>
        </li>
      ))}
    </ul>
  );
}
