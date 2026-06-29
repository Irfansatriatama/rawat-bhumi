"use client";

import { Download, Share2 } from "lucide-react";

/**
 * Aksi sertifikat: Unduh (print → "Simpan sebagai PDF") & Bagikan (Web Share API).
 * Zero-dep & berfungsi nyata di mobile/desktop.
 */
export function CertificateActions({ title }: { title: string }) {
  async function share() {
    const data = { title, text: `${title} — Rawat Bhumi`, url: typeof window !== "undefined" ? window.location.href : "" };
    if (navigator.share) {
      await navigator.share(data).catch(() => {});
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(data.url).catch(() => {});
      alert("Tautan sertifikat disalin.");
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 print:hidden">
      <button
        onClick={() => window.print()}
        className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-dark py-3.5 text-sm font-semibold text-white"
      >
        <Download size={17} /> Unduh PDF
      </button>
      <button
        onClick={share}
        className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-soft py-3.5 text-sm font-semibold text-brand-600"
      >
        <Share2 size={17} /> Bagikan
      </button>
    </div>
  );
}
