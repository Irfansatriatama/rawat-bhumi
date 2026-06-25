"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Truck, Leaf, Recycle, ArrowRight } from "lucide-react";

export type HeroSlide = {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
};

/**
 * Banner berjalan di atas halaman Belajar — gradient eco + ornamen, dots geser.
 * Konsisten dengan bahasa visual hero Beranda (gradient teal, daun, truk).
 */
export function BelajarHero({ slides }: { slides: HeroSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(slides.length - 1, Math.max(0, idx)));
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        {slides.map((s, i) => (
          <div key={i} className="w-full shrink-0 snap-center">
            <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-brand-dark via-brand-600 to-brand p-5 text-white [box-shadow:var(--shadow-soft)]">
              {/* ornamen */}
              <div className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <Truck className="pointer-events-none absolute -bottom-4 right-2 text-white/15" size={120} strokeWidth={1.2} />
              <Leaf className="pointer-events-none absolute right-24 top-5 text-brand-lime/40" size={36} />
              <Recycle className="pointer-events-none absolute bottom-6 right-28 text-white/15" size={28} />

              <div className="relative min-h-[150px] max-w-[16rem]">
                <h2 className="text-[22px] font-bold leading-tight">{s.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-white/80">{s.subtitle}</p>
                <Link
                  href={s.href}
                  className="press mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-dark"
                >
                  {s.cta} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-4 bg-brand-600" : "w-1.5 bg-brand-dark/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
