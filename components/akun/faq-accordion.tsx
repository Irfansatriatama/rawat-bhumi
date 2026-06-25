"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type Faq = { q: string; a: string };

export function FaqAccordion({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-brand-dark/5">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
            >
              <span className="text-sm font-semibold text-brand-dark">{it.q}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-brand-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div className={`grid transition-all duration-200 ${isOpen ? "grid-rows-[1fr] pb-3.5" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className="text-sm leading-relaxed text-gray-500">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
