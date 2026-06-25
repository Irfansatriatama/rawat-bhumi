"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { REVENUE_SOURCE, ENTRY_TYPE } from "@/lib/prisma-enums";
import { currentPeriod } from "@/lib/format";
import { Card, IconChip } from "@/components/ui/primitives";

// Sumber yang bersifat biaya (cost center) vs pendapatan
const COST_SOURCES: string[] = [REVENUE_SOURCE.COST_PIROLISIS, REVENUE_SOURCE.COST_B3];

export function RevenueCreateForm() {
  const router = useRouter();
  const [source, setSource] = useState<string>(REVENUE_SOURCE.MAGGOT);
  const [amount, setAmount] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [period, setPeriod] = useState(currentPeriod());
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const input = "rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand";
  const type = COST_SOURCES.includes(source) ? ENTRY_TYPE.COST : ENTRY_TYPE.REVENUE;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/hilir/revenue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source,
        type,
        amount: Number(amount),
        weightKg: weightKg ? Number(weightKg) : null,
        unitPrice: unitPrice ? Number(unitPrice) : null,
        period,
      }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(d.error ?? "Gagal");
    setMsg(null);
    setAmount("");
    setWeightKg("");
    setUnitPrice("");
    router.refresh();
  }

  return (
    <Card className="p-5">
      <form onSubmit={submit}>
      <div className="mb-1 flex items-center gap-3">
        <IconChip icon={Wallet} tone="green" size={36} />
        <h2 className="font-semibold text-brand-dark">Catat Revenue / Biaya</h2>
      </div>
      <p className="mb-4 text-xs text-gray-500">
        Tipe otomatis: <b>{type}</b> (cost untuk pirolisis & B3).
      </p>
      {msg && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{msg}</p>}
      <div className="flex flex-wrap items-end gap-3">
        <select className={input} value={source} onChange={(e) => setSource(e.target.value)}>
          {Object.values(REVENUE_SOURCE).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input className={input} type="number" min={0} placeholder="Jumlah (Rp)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <input className={input} type="number" step="0.01" min={0} placeholder="Berat (kg, opsional)" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        <input className={input} type="number" min={0} placeholder="Harga/kg (opsional)" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
        <input className={input} placeholder="Periode (YYYY-MM)" value={period} onChange={(e) => setPeriod(e.target.value)} />
        <button disabled={loading} className="rounded-lg bg-brand-dark px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60">
          {loading ? "…" : "Catat"}
        </button>
      </div>
      </form>
    </Card>
  );
}
