import { Loader2 } from "lucide-react";

/**
 * Sistem loading konsisten Rawat Bhumi.
 * - <Spinner/>        : spinner brand dasar (dipakai di mana saja).
 * - <LoadingOverlay/> : popup loading di tengah layar (untuk ganti halaman / proses berat).
 * - <Button/>         : tombol dengan state loading bawaan (spinner di dalam tombol).
 * Semua memakai ikon Loader2 (lucide) + animate-spin agar bentuknya seragam.
 */

export function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  return <Loader2 size={size} strokeWidth={2.4} className={`animate-spin ${className}`} aria-hidden />;
}

/** Popup loading di tengah layar — dipakai sebagai fallback loading.tsx saat ganti halaman. */
export function LoadingOverlay({ label = "Memuat…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 grid place-items-center bg-brand-tint/60 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] bg-white px-9 py-7 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
        <Spinner size={30} className="text-brand-600" />
        <p className="text-sm font-medium text-brand-dark">{label}</p>
      </div>
    </div>
  );
}

/** Loading inline kecil (di tengah sebuah seksi/kartu, bukan full screen). */
export function InlineLoading({ label = "Memuat…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
      <Spinner size={18} className="text-brand-600" />
      {label}
    </div>
  );
}

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT: Record<Variant, string> = {
  primary: "bg-brand-dark text-white hover:opacity-90",
  secondary: "text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50",
  danger: "bg-brand-red text-white hover:opacity-90",
  ghost: "text-brand-dark hover:bg-brand-soft",
};

/**
 * Tombol standar dengan loading. Saat `loading` true: tombol disabled + spinner muncul
 * di depan label. Sisanya (onClick, type, form, dll.) diteruskan apa adanya.
 */
export function Button({
  loading = false,
  variant = "primary",
  className = "",
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; variant?: Variant }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`press inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 ${VARIANT[variant]} ${className}`}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}
