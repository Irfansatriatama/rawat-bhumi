"use client";

import { useRef, useState } from "react";
import { CalendarDays, Clock, MapPin, Bookmark, Trees } from "lucide-react";

export type EventItem = {
  id: string;
  title: string;
  category: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  imageUrl: string | null;
};

export function EventCarousel({ items }: { items: EventItem[] }) {
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
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4"
      >
        {items.map((ev) => (
          <div key={ev.id} className="w-[88%] shrink-0 snap-start">
            <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-brand-dark/5">
              <div className="relative aspect-[16/8] bg-gradient-to-br from-brand-dark/20 to-brand/20">
                {ev.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ev.imageUrl} alt={ev.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="absolute inset-0 grid place-items-center">
                    <Trees size={40} className="text-brand-dark/30" />
                  </span>
                )}
                <span className="absolute bottom-2 left-2 rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                  {ev.category}
                </span>
              </div>
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold leading-snug text-brand-dark">{ev.title}</p>
                  <Bookmark size={18} className="mt-0.5 shrink-0 text-gray-300" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1"><CalendarDays size={12} className="text-brand-600" /> {ev.dateLabel}</span>
                  <span className="flex items-center gap-1"><Clock size={12} className="text-brand-600" /> {ev.timeLabel}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-brand-600" /> {ev.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === active ? "w-4 bg-brand-600" : "w-1.5 bg-brand-dark/20"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
