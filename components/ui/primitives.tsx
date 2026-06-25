import type { LucideIcon } from "lucide-react";

type Tone = "green" | "amber" | "teal" | "lime" | "red" | "slate";

const TONE: Record<Tone, { chip: string; icon: string }> = {
  green: { chip: "bg-brand-soft", icon: "text-brand-600" },
  teal: { chip: "bg-brand-dark/10", icon: "text-brand-dark" },
  amber: { chip: "bg-amber-100", icon: "text-brand-amber" },
  lime: { chip: "bg-lime-100", icon: "text-lime-700" },
  red: { chip: "bg-red-100", icon: "text-brand-red" },
  slate: { chip: "bg-slate-100", icon: "text-slate-600" },
};

/** Lingkaran ikon berwarna lembut — bahasa visual konsisten di seluruh app. */
export function IconChip({
  icon: Icon,
  tone = "green",
  size = 40,
}: {
  icon: LucideIcon;
  tone?: Tone;
  size?: number;
}) {
  const t = TONE[tone];
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-2xl ${t.chip}`}
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.5} strokeWidth={2} className={t.icon} />
    </span>
  );
}

/** Kartu dasar — satu skala sudut & bayangan untuk semua. */
export function Card({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-[var(--radius-card)] bg-white ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Kartu statistik dengan ikon + angka besar. */
export function StatCard({
  icon,
  tone = "green",
  value,
  label,
  suffix,
}: {
  icon: LucideIcon;
  tone?: Tone;
  value: string | number;
  label: string;
  suffix?: string;
}) {
  return (
    <Card className="p-4">
      <IconChip icon={icon} tone={tone} size={36} />
      <p className="mt-3 text-2xl font-semibold leading-none tracking-tight text-brand-dark">
        {value}
        {suffix && <span className="ml-1 text-sm font-medium text-gray-400">{suffix}</span>}
      </p>
      <p className="mt-1.5 text-xs text-gray-500">{label}</p>
    </Card>
  );
}

/** Judul halaman (admin/desktop) — judul besar + subjudul + slot aksi kanan. */
export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Judul seksi kecil. */
export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-brand-dark">{children}</h2>
      {action}
    </div>
  );
}

/** Empty state ramah dengan ikon. */
export function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-brand-dark/15 bg-white/50 px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft">
        <Icon size={22} strokeWidth={2} className="text-brand-600" />
      </span>
      <p className="mt-3 text-sm font-medium text-brand-dark">{title}</p>
      {hint && <p className="mt-1 max-w-[34ch] text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

/** Badge status kecil. */
export function StatusBadge({ tone = "green", children }: { tone?: Tone; children: React.ReactNode }) {
  const t = TONE[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${t.chip} ${t.icon}`}>
      {children}
    </span>
  );
}
