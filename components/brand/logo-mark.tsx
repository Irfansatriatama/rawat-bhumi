/**
 * Emblem Rawat Bhumi — memakai logo resmi `public/brand/emblem.png`
 * (rosette gradient hijau→teal dari GPS_IDENTITAS). Hanya <img> tanpa state,
 * aman dipakai di server & client.
 *
 * Catatan kontras: emblem berwarna paling bersih di atas latar TERANG.
 * Untuk latar gelap, bungkus dengan tile putih (lihat `LogoTile`).
 */
export function LogoMark({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/emblem.png"
      alt="Logo Rawat Bhumi"
      width={size}
      height={size}
      draggable={false}
      style={{ width: size, height: size }}
      className={className}
    />
  );
}

/**
 * Emblem di atas tile putih membulat — dipakai pada latar gelap
 * (header gradient, splash gelap) agar logo tetap kontras & "premium".
 */
export function LogoTile({
  size = 56,
  pad = 8,
  className = "",
}: {
  size?: number;
  pad?: number;
  className?: string;
}) {
  return (
    <span
      className={`grid place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5 ${className}`}
      style={{ width: size, height: size }}
    >
      <LogoMark size={size - pad * 2} />
    </span>
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
