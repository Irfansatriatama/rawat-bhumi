"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Trash2, ClipboardCheck, Clock, X, ChevronRight, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Panduan = {
  key: string;
  icon: LucideIcon;
  text: string;
  title: string;
  summary: string;
  points: string[];
};

const PANDUAN: Panduan[] = [
  {
    key: "kategori",
    icon: Package,
    text: "Pisahkan sampah sesuai kategori",
    title: "Pisahkan sampah sesuai kategori",
    summary: "Pemilahan dari rumah memastikan tiap sampah masuk jalur olah yang tepat.",
    points: [
      "Organik: sisa makanan, daun, kulit buah",
      "Anorganik: plastik, kertas, kaleng, botol",
      "Residu: popok, puntung, styrofoam",
      "B3 & E-Waste: baterai, lampu, elektronik",
    ],
  },
  {
    key: "wadah",
    icon: Trash2,
    text: "Gunakan kantong atau wadah tertutup",
    title: "Gunakan kantong atau wadah tertutup",
    summary: "Wadah tertutup mencegah bau, lalat, dan sampah tercecer saat dijemput.",
    points: [
      "Pakai kantong/ember terpisah per kategori dan ikat rapat",
      "Beri label sederhana bila wadahnya mirip",
      "Jangan campur B3 dengan sampah lain",
    ],
  },
  {
    key: "lokasi",
    icon: ClipboardCheck,
    text: "Letakkan di lokasi yang mudah diakses",
    title: "Letakkan di lokasi yang mudah diakses",
    summary: "Tempatkan sampah di titik yang gampang dijangkau kurir agar penjemputan cepat.",
    points: [
      "Taruh di depan rumah/pagar 15 menit sebelum jam pickup",
      "Tidak menghalangi jalan atau kendaraan tetangga",
      'Tambahkan catatan lokasi (mis. "pagar hitam")',
    ],
  },
  {
    key: "jadwal",
    icon: Clock,
    text: "Pastikan sesuai jadwal pickup",
    title: "Pastikan sesuai jadwal pickup",
    summary: "Konfirmasi kehadiran agar kurir tahu rumahmu perlu dijemput sesuai jadwal RT.",
    points: [
      "Konfirmasi sebelum pukul 20.00 di malam sebelum pickup",
      "Cek jadwal mingguan RT-mu di halaman Jadwal",
      "Pantau status kurir di halaman Tracking",
    ],
  },
];

export function PanduanPickup() {
  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const item = active !== null ? PANDUAN[active] : null;

  useEffect(() => {
    if (active === null) return;
    const id = requestAnimationFrame(() => setShown(true));
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  function close() {
    setShown(false);
    setTimeout(() => setActive(null), 200);
  }

  return (
    <>
      <div className="rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-brand-dark">Panduan Sebelum Pickup</h3>
          <Link href="/pickup/panduan" className="press flex items-center gap-0.5 text-xs font-medium text-brand-600">
            Lihat Detail <ChevronRight size={14} />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {PANDUAN.map((p, i) => {
            const Icon = p.icon;
            return (
              <button
                key={p.key}
                onClick={() => setActive(i)}
                className="press flex flex-col items-center text-center"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft">
                  <Icon size={26} strokeWidth={1.8} className="text-brand-600" />
                </span>
                <span className="mt-2 text-[10.5px] font-medium leading-tight text-gray-500">{p.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== POPUP / BOTTOM SHEET ===== */}
      {item && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            onClick={close}
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
            className={`relative w-full max-w-[430px] rounded-t-[28px] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 [box-shadow:0_-8px_40px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
              shown ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-brand-dark/10" />

            <div className="flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft">
                <item.icon size={24} strokeWidth={2} className="text-brand-600" />
              </span>
              <h3 className="mt-0.5 flex-1 text-base font-bold leading-tight text-brand-dark">{item.title}</h3>
              <button onClick={close} aria-label="Tutup" className="press grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-tint">
                <X size={16} className="text-brand-dark" />
              </button>
            </div>

            <p className="mt-3 text-[13px] leading-relaxed text-gray-600">{item.summary}</p>

            <ul className="mt-3 space-y-2">
              {item.points.map((pt) => (
                <li key={pt} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-600">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className="text-[13px] leading-relaxed text-gray-600">{pt}</span>
                </li>
              ))}
            </ul>

            <Link
              href={`/pickup/panduan#${item.key}`}
              className="press mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3.5 text-sm font-semibold text-white"
            >
              Lihat Detail <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
