import { Lightbulb, Leaf } from "lucide-react";
import { AppHeader } from "@/components/ui/app-header";
import { TIPS } from "@/lib/belajar";

export default function TipsPage() {
  return (
    <div>
      <AppHeader title="Tahukah Kamu?" subtitle="Fakta & tips singkat seputar sampah" icon={Lightbulb} />

      <div className="space-y-3 p-5">
        {TIPS.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft">
              <Leaf size={22} className="text-brand-600" />
            </span>
            <p className="text-xs leading-relaxed text-gray-600">{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
