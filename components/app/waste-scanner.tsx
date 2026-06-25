"use client";

import { useState } from "react";
import type { WasteScanResult } from "@/lib/gemini";
import { Spinner } from "@/components/ui/loading";

export function WasteScanner() {
  const [result, setResult] = useState<WasteScanResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      setLoading(true);
      const res = await fetch("/api/gemini/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const d = await res.json();
      setLoading(false);
      if (!res.ok) return setErr(d.error ?? "Gagal memindai");
      setResult(d);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <label
        aria-busy={loading || undefined}
        className={`flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand/40 bg-brand-bg p-6 text-center ${
          loading ? "pointer-events-none opacity-60" : "cursor-pointer"
        }`}
      >
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} disabled={loading} />
        {loading && <Spinner size={16} className="text-brand-dark" />}
        <span className="text-sm font-medium text-brand-dark">
          {loading ? "Memindai…" : "📷 Ambil / unggah foto sampah"}
        </span>
      </label>

      {preview && <img src={preview} alt="preview" className="mx-auto max-h-48 rounded-xl object-contain" />}
      {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{err}</p>}

      {result && (
        <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
          <p className="text-xs font-medium uppercase text-brand">{result.kategori}</p>
          <p className="font-semibold text-brand-dark">{result.material}</p>
          <dl className="mt-2 space-y-1 text-sm text-gray-600">
            <div><dt className="inline font-medium">Cara pilah: </dt><dd className="inline">{result.caraPilah}</dd></div>
            <div><dt className="inline font-medium">Nilai: </dt><dd className="inline">{result.nilaiEkonomiPerKg}</dd></div>
            <div><dt className="inline font-medium">Tips simpan: </dt><dd className="inline">{result.tipsSimpan}</dd></div>
          </dl>
        </div>
      )}
    </div>
  );
}
