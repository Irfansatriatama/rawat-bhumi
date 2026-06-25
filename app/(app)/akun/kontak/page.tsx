import { MessageCircle, Phone, Mail, MapPin, Clock, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppHeader } from "@/components/ui/app-header";
import { Card } from "@/components/ui/primitives";

const CHANNELS: { icon: LucideIcon; tone: string; label: string; value: string; href: string }[] = [
  { icon: MessageCircle, tone: "bg-brand-soft text-brand-600", label: "WhatsApp", value: "0811-1000-200", href: "https://wa.me/628111000200" },
  { icon: Phone, tone: "bg-brand-dark/10 text-brand-dark", label: "Telepon", value: "(021) 700-200", href: "tel:+62217002000" },
  { icon: Mail, tone: "bg-amber-100 text-brand-amber", label: "Email", value: "halo@rawatbhumi.id", href: "mailto:halo@rawatbhumi.id" },
];

export default function KontakPage() {
  return (
    <div>
      <AppHeader title="Hubungi Kami" subtitle="Kami senang mendengar dari kamu" icon={MessageCircle} />
      <div className="space-y-4 p-5">
        <Card className="divide-y divide-brand-dark/5 overflow-hidden">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            return (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="press flex items-center gap-3.5 p-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${c.tone}`}>
                  <Icon size={20} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-dark">{c.label}</p>
                  <p className="text-xs text-gray-500">{c.value}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </a>
            );
          })}
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft">
              <MapPin size={19} className="text-brand-600" />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-dark">Kantor Rawat Bhumi</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                Jl. Lestari Raya No. 1, Jagakarsa, Jakarta Selatan 12620
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-brand-dark/5 pt-3 text-xs text-gray-500">
            <Clock size={13} className="text-brand-600" /> Senin - Sabtu, 08.00 - 17.00 WIB
          </div>
        </Card>
      </div>
    </div>
  );
}
