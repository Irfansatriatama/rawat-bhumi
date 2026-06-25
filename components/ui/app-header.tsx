import type { LucideIcon } from "lucide-react";

/**
 * Header eco: gradient teal membulat di bawah, dengan ornamen lingkaran lembut.
 * Dipakai konsisten di seluruh halaman warga.
 */
export function AppHeader({
  title,
  subtitle,
  icon: Icon,
  eyebrow,
  right,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  eyebrow?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="app-header relative overflow-hidden rounded-b-[28px] px-5 pb-7 pt-9 text-white">
      {/* ornamen lingkaran lembut */}
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-brand/10" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 text-xs font-medium text-brand-lime">{eyebrow}</p>
          )}
          <div className="flex items-center gap-2.5">
            {Icon && (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
                <Icon size={18} strokeWidth={2} className="text-white" />
              </span>
            )}
            <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
          </div>
          {subtitle && <p className="mt-1.5 text-sm text-white/70">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}
