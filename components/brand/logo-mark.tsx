/**
 * Emblem Rawat Bhumi — rosette daun (leaf pattern) dalam dua nuansa hijau,
 * mengikuti logo pada referensi splash. Dipakai di splash, login, dan PWA.
 *
 * Hanya markup SVG (tanpa state) sehingga aman dipakai di server/client.
 */
export function LogoMark({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="Logo Rawat Bhumi"
      className={className}
    >
      {/* Empat kelopak daun mengelilingi pusat, warna selang-seling */}
      <g>
        {/* atas */}
        <path
          d="M32 5c7 5 10 11 10 17 0 6-4 10-10 10s-10-4-10-10c0-6 3-12 10-17Z"
          fill="#4ce059"
        />
        {/* kanan */}
        <path
          d="M59 32c-5 7-11 10-17 10-6 0-10-4-10-10s4-10 10-10c6 0 12 3 17 10Z"
          fill="#0f5d4d"
        />
        {/* bawah */}
        <path
          d="M32 59c-7-5-10-11-10-17 0-6 4-10 10-10s10 4 10 10c0 6-3 12-10 17Z"
          fill="#22b24c"
        />
        {/* kiri */}
        <path
          d="M5 32c5-7 11-10 17-10 6 0 10 4 10 10s-4 10-10 10C16 42 10 39 5 32Z"
          fill="#0a3f34"
        />
      </g>
      {/* tulang daun lembut */}
      <g stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.55">
        <path d="M32 12v16" />
        <path d="M52 32H36" />
        <path d="M32 52V36" />
        <path d="M12 32h16" />
      </g>
      {/* mata pusat */}
      <circle cx="32" cy="32" r="4.4" fill="#f3f8f4" />
      <circle cx="32" cy="32" r="2" fill="#22b24c" />
    </svg>
  );
}

/** Emblem + wordmark vertikal (dipakai di splash). */
export function LogoLockup({
  className = "",
  markSize = 64,
  align = "center",
}: {
  className?: string;
  markSize?: number;
  align?: "center" | "left";
}) {
  return (
    <div
      className={`flex ${align === "center" ? "flex-col items-center text-center" : "flex-row items-center gap-3 text-left"} ${className}`}
    >
      <LogoMark size={markSize} />
      <p
        className={`font-bold leading-[1.05] tracking-tight text-brand-dark ${
          align === "center" ? "mt-3 text-[2rem]" : "text-2xl"
        }`}
      >
        Rawat<br className={align === "center" ? "" : "hidden"} /> Bhumi
      </p>
    </div>
  );
}
