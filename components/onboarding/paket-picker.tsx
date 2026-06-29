"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Building2, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/loading";

const PLANS: { id: string; icon: LucideIcon; name: string; price: string; desc: string; freq: string }[] = [
  { id: "RUMAH_TANGGA", icon: Home, name: "Rumah Tangga", price: "Rp 50.000", desc: "Untuk keluarga / rumah", freq: "Pickup harian organik + mingguan lainnya" },
  { id: "PREMIUM", icon: Building2, name: "Komunitas / UMKM", price: "Rp 75.000", desc: "Untuk usaha, kafe, komunitas", freq: "Volume lebih besar + prioritas jadwal" },
];

export function PaketPicker() {
  const router = useRouter();
  const [plan, setPlan] = useState("RUMAH_TANGGA");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/onboarding/paket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/onboarding/komunitas");
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {PLANS.map((p) => {
        const Icon = p.icon;
        const on = plan === p.id;
        return (
          <button
            key={p.id}
            onClick={() => setPlan(p.id)}
            className={`press flex w-full items-start gap-3 rounded-2xl border-2 bg-white p-4 text-left transition ${
              on ? "border-brand-600 ring-2 ring-brand-600/15" : "border-brand-dark/5"
            }`}
          >
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${on ? "bg-brand-600 text-white" : "bg-brand-soft text-brand-600"}`}>
              <Icon size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-brand-dark">{p.name}</p>
                {on && <Check size={18} className="text-brand-600" />}
              </div>
              <p className="text-xs text-gray-500">{p.desc}</p>
              <p className="mt-1.5 text-sm font-bold text-brand-600">{p.price}<span className="text-xs font-normal text-gray-400">/bulan</span></p>
              <p className="mt-0.5 text-[11px] text-gray-400">{p.freq}</p>
            </div>
          </button>
        );
      })}

      <p className="px-1 text-[11px] text-gray-400">
        Pembayaran iuran dilakukan setelah wilayahmu aktif. Paket bisa diganti nanti di Akun → Paket Saya.
      </p>

      <Button onClick={submit} loading={loading} className="w-full py-3 text-base">
        {loading ? "Menyimpan…" : "Lanjut"}
      </Button>
    </div>
  );
}
