"use client";

import { useState } from "react";
import { Sprout, Share2, Copy, Check } from "lucide-react";

/**
 * Kartu state Founding Member di Beranda — muncul selama wilayah belum aktif.
 * Menampilkan progress X/target KK + link referral untuk mengajak tetangga.
 */
export function FoundingCard({
  count,
  target,
  code,
}: {
  count: number;
  target: number;
  code: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const pct = Math.min(100, Math.round((count / Math.max(1, target)) * 100));
  const link =
    typeof window !== "undefined" && code ? `${window.location.origin}/daftar?ref=${code}` : "";

  async function share() {
    const data = { title: "Rawat Bhumi", text: "Yuk gabung kelola sampah di RT kita!", url: link };
    if (navigator.share) await navigator.share(data).catch(() => {});
    else await copy();
  }
  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-brand-dark to-brand-deep p-5 text-white [box-shadow:var(--shadow-soft)]">
      <div className="flex items-center gap-2">
        <Sprout size={18} className="text-brand-lime" />
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-lime">Founding Member</p>
      </div>
      <h2 className="mt-2 text-lg font-bold leading-snug">Kamu pelopor di RT ini! 🌱</h2>
      <p className="mt-1 text-sm text-white/75">
        Ajak tetangga bergabung. Saat target tercapai, Ketua RT mengaktifkan layanan penjemputan.
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-semibold">{count} / {target} KK</span>
          <span className="text-brand-lime">{pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-brand-lime transition-all" style={{ width: `${Math.max(4, pct)}%` }} />
        </div>
      </div>

      {code && (
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button onClick={share} className="press flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-brand-dark">
            <Share2 size={16} /> Bagikan Ajakan
          </button>
          <button onClick={copy} className="press flex items-center justify-center gap-2 rounded-2xl bg-white/15 py-3 text-sm font-semibold text-white ring-1 ring-white/15">
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Tersalin" : "Salin Link"}
          </button>
        </div>
      )}
    </div>
  );
}
