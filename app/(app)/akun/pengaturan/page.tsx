import Link from "next/link";
import { Settings, Bell, Globe, ShieldCheck, Lock, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppHeader } from "@/components/ui/app-header";
import { Card } from "@/components/ui/primitives";

const ROWS: { icon: LucideIcon; label: string; sub: string; href: string }[] = [
  { icon: Bell, label: "Notifikasi", sub: "Atur kategori notif yang kamu terima", href: "/akun/notifikasi" },
  { icon: Globe, label: "Bahasa", sub: "Bahasa Indonesia", href: "/akun/bahasa" },
  { icon: ShieldCheck, label: "Keamanan Akun", sub: "Kelola keamanan & sesi", href: "/akun/keamanan" },
  { icon: Lock, label: "Kebijakan Privasi", sub: "Bagaimana data kamu dilindungi", href: "/akun/privasi" },
];

export default function PengaturanPage() {
  return (
    <div className="bg-brand-tint pb-6">
      <AppHeader title="Pengaturan" subtitle="Notifikasi, bahasa, privasi" icon={Settings} />
      <div className="p-4">
        <Card className="divide-y divide-brand-dark/5 p-2">
          {ROWS.map((r) => {
            const Icon = r.icon;
            return (
              <Link key={r.href} href={r.href} className="press flex items-center gap-3.5 px-2 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-600">
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brand-dark">{r.label}</p>
                  <p className="truncate text-xs text-gray-400">{r.sub}</p>
                </div>
                <ChevronRight size={17} className="shrink-0 text-gray-300" />
              </Link>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
