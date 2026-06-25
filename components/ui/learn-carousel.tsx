"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Play, BookOpen } from "lucide-react";

export type LearnItem = {
  slug: string;
  title: string;
  category: string;
  hasVideo: boolean;
  imageUrl: string | null;
};

export function LearnCarousel({ items }: { items: LearnItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / (el.scrollWidth / items.length));
    setActive(Math.min(items.length - 1, Math.max(0, idx)));
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1"
      >
        {items.map((it) => (
          <Link
            key={it.slug}
            href={`/belajar/${it.slug}`}
            className="press w-[78%] shrink-0 snap-start"
          >
            <div className="overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
              {/* thumbnail */}
              <div className="relative aspect-[16/9] bg-gradient-to-br from-brand-dark/15 to-brand/15">
                {it.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.imageUrl} alt={it.title} className="h-full w-full object-cover" />
                )}
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-brand-dark shadow">
                    {it.hasVideo ? <Play size={18} className="ml-0.5 fill-current" /> : <BookOpen size={18} />}
                  </span>
                </span>
              </div>
              <div className="p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                  {it.category}
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-brand-dark">
                  {it.title}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* dots */}
      {items.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {items.map((_, i) => (
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
