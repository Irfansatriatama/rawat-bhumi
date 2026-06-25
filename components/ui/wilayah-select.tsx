"use client";

import { useRouter } from "next/navigation";
import { MapPin, ChevronDown } from "lucide-react";

export type WilayahOption = { id: string; label: string };

/** Dropdown filter wilayah (RW). Navigasi lewat ?rw= agar data ikut tersaring. */
export function WilayahSelect({
  options,
  value,
}: {
  options: WilayahOption[];
  value: string;
}) {
  const router = useRouter();
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
        <MapPin size={17} className="text-brand-600" />
      </span>
      <select
        value={value}
        onChange={(e) => router.push(`/komunitas?rw=${e.target.value}`)}
        className="press w-full appearance-none rounded-2xl border border-brand-dark/10 bg-white py-3.5 pl-11 pr-10 text-sm font-medium text-brand-dark outline-none focus:border-brand-600"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
        <ChevronDown size={18} className="text-gray-400" />
      </span>
    </div>
  );
}
