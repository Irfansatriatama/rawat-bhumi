"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Spinner } from "@/components/ui/loading";

const CATEGORIES = ["Pickup terlambat", "Sampah tidak terangkut", "Masalah pembayaran", "Aplikasi error", "Lainnya"];
const field = "w-full rounded-xl border border-brand-dark/10 bg-white px-3.5 py-3 text-sm text-brand-dark outline-none focus:border-brand-600";

export function ReportForm() {
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [desc, setDesc] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    // Demo: laporan dicatat di sisi UI. Integrasi tiket/notifikasi admin menyusul.
    await new Promise((r) => setTimeout(r, 700));
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CheckCircle2 size={48} className="text-brand-600" />
        <p className="mt-3 font-semibold text-brand-dark">Laporan terkirim</p>
        <p className="mt-1 max-w-[30ch] text-sm text-gray-500">
          Terima kasih. Tim Rawat Bhumi akan menindaklanjuti laporanmu.
        </p>
        <button
          onClick={() => {
            setDesc("");
            setState("idle");
          }}
          className="press mt-5 rounded-xl bg-brand-tint px-5 py-2.5 text-sm font-semibold text-brand-dark"
        >
          Kirim laporan lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-500">Kategori masalah</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`press rounded-full px-3.5 py-2 text-xs font-medium ${
                cat === c ? "bg-brand-dark text-white" : "bg-brand-tint text-gray-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-500">Ceritakan masalahnya</label>
        <textarea
          className={`${field} min-h-32 resize-none`}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Jelaskan apa yang terjadi, kapan, dan di mana…"
          required
        />
      </div>
      <button
        type="submit"
        disabled={state === "sending"}
        className="press flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {state === "sending" ? <Spinner size={16} /> : <Send size={16} />}
        {state === "sending" ? "Mengirim…" : "Kirim laporan"}
      </button>
    </form>
  );
}
