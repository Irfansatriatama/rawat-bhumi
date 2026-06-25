"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const LANGS = [
  { code: "id", label: "Bahasa Indonesia", note: "Default" },
  { code: "en", label: "English", note: "Segera hadir" },
  { code: "jv", label: "Basa Jawa", note: "Segera hadir" },
];

export function LanguageSelect() {
  const [active, setActive] = useState("id");

  useEffect(() => {
    const saved = localStorage.getItem("rb_lang");
    if (saved) setActive(saved);
  }, []);

  function pick(code: string) {
    // Hanya 'id' yang tersedia saat ini (belum ada sistem i18n).
    if (code !== "id") return;
    setActive(code);
    localStorage.setItem("rb_lang", code);
  }

  return (
    <div className="divide-y divide-brand-dark/5">
      {LANGS.map((l) => {
        const disabled = l.code !== "id";
        return (
          <button
            key={l.code}
            onClick={() => pick(l.code)}
            disabled={disabled}
            className="flex w-full items-center justify-between py-3.5 text-left disabled:opacity-50"
          >
            <div>
              <p className="text-sm font-medium text-brand-dark">{l.label}</p>
              <p className="text-[11px] text-gray-400">{l.note}</p>
            </div>
            {active === l.code && (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600">
                <Check size={14} strokeWidth={3} className="text-white" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
