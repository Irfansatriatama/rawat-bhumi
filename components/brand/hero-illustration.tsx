/* eslint-disable @next/next/no-img-element */
/**
 * Ilustrasi hero splash — "warga merawat bumi".
 *
 * Secara default merender adegan SVG flat (globe + dedaunan + warga + danau)
 * dengan palet brand, dan bagian bawah melengkung ke teal gelap agar menyatu
 * dengan seksi gelap di splash.
 *
 * Untuk kemiripan 1:1 dengan referensi, taruh aset asli di
 * `public/illustrations/splash-hero.png` lalu kirim `src="/illustrations/splash-hero.png"`.
 */
export function HeroIllustration({
  className = "",
  src,
}: {
  className?: string;
  src?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt="Warga bergotong royong merawat lingkungan"
        className={`w-full select-none object-cover ${className}`}
        draggable={false}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      role="img"
      aria-label="Warga bergotong royong merawat lingkungan"
      className={`w-full select-none ${className}`}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef8ef" />
          <stop offset="1" stopColor="#cdeccf" />
        </linearGradient>
        <radialGradient id="globe" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#8fd86a" />
          <stop offset="1" stopColor="#4ca64a" />
        </radialGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5db84f" />
          <stop offset="1" stopColor="#2f8f43" />
        </linearGradient>
        <clipPath id="frame">
          <rect width="400" height="300" rx="0" />
        </clipPath>
      </defs>

      <g clipPath="url(#frame)">
        {/* langit */}
        <rect width="400" height="300" fill="url(#sky)" />

        {/* siluet kota di kejauhan */}
        <g fill="#bfe3c0" opacity="0.7">
          <rect x="20" y="92" width="22" height="70" rx="3" />
          <rect x="46" y="74" width="16" height="88" rx="3" />
          <rect x="300" y="84" width="20" height="78" rx="3" />
          <rect x="324" y="100" width="26" height="62" rx="3" />
          <rect x="356" y="78" width="16" height="84" rx="3" />
        </g>
        {/* pepohonan kejauhan */}
        <g fill="#a6d9a0" opacity="0.85">
          <circle cx="78" cy="150" r="26" />
          <circle cx="110" cy="150" r="20" />
          <circle cx="300" cy="150" r="24" />
          <circle cx="330" cy="152" r="18" />
        </g>

        {/* dua daun besar di belakang globe */}
        <path d="M150 150c-26-26-30-66-12-104 38 12 60 44 60 80 0 14-6 24-16 30-12 6-22 4-32-6Z" fill="#3aa14a" opacity="0.55" />
        <path d="M250 150c26-26 30-66 12-104-38 12-60 44-60 80 0 14 6 24 16 30 12 6 22 4 32-6Z" fill="#2f8f43" opacity="0.55" />

        {/* globe */}
        <circle cx="200" cy="138" r="62" fill="url(#globe)" />
        <g fill="#3f9a47" opacity="0.85">
          <path d="M168 110c12-4 22 2 30 0s14-8 22-4c6 3 6 12-2 16-10 5-12 12-22 12s-16-6-24-6-12 6-14 0c-2-8 2-14 10-18Z" />
          <path d="M196 158c8-2 16 4 24 2 8-2 14 2 12 8-2 8-14 8-22 8s-18-2-20-10c-1-6 2-7 6-8Z" />
        </g>
        <ellipse cx="180" cy="118" rx="20" ry="10" fill="#ffffff" opacity="0.25" />

        {/* danau */}
        <ellipse cx="200" cy="232" rx="150" ry="30" fill="#bfe6df" />
        <ellipse cx="200" cy="226" rx="150" ry="26" fill="#9fd9cf" />

        {/* tanah */}
        <path d="M0 250c60-26 120-26 200-26s140 0 200 26v50H0Z" fill="url(#ground)" />

        {/* === warga (figur flat) === */}
        {/* kiri — bawa kantong daur ulang */}
        <g>
          <circle cx="92" cy="214" r="9" fill="#e9c2a0" />
          <path d="M82 226c0-6 4-10 10-10s10 4 10 12l-2 18H84Z" fill="#1f9d52" />
          <rect x="86" y="244" width="6" height="16" rx="3" fill="#173a30" />
          <rect x="94" y="244" width="6" height="16" rx="3" fill="#173a30" />
          {/* kantong */}
          <path d="M70 232l4 28h14l4-28Z" fill="#1c2b25" />
          <path d="M74 226h16l-2 8H76Z" fill="#2a3d34" />
        </g>

        {/* tengah-kiri — menyapu */}
        <g>
          <circle cx="150" cy="210" r="9" fill="#d9a87f" />
          <path d="M140 222c0-6 4-10 10-10s10 4 10 12l-2 20h-16Z" fill="#1f9d55" />
          <rect x="144" y="252" width="6" height="14" rx="3" fill="#173a30" />
          <rect x="152" y="252" width="6" height="14" rx="3" fill="#173a30" />
          <path d="M158 220l24 30" stroke="#9a6b3f" strokeWidth="3" strokeLinecap="round" />
          <path d="M178 246l12 8-2 6-14-6Z" fill="#7fae3a" />
        </g>

        {/* tengah-kanan — menanam bibit (jongkok) */}
        <g>
          <circle cx="236" cy="220" r="9" fill="#e9c2a0" />
          <path d="M226 232c0-6 5-10 10-10s11 5 10 12l-2 14h-16Z" fill="#1f9d52" />
          <rect x="228" y="256" width="14" height="6" rx="3" fill="#173a30" />
          {/* bibit */}
          <path d="M252 258c0-10 4-16 10-18-2 8 0 12 4 16Z" fill="#2f9e4a" />
          <rect x="256" y="256" width="10" height="8" rx="2" fill="#6b4a2f" />
        </g>

        {/* kanan — berdiri menyiram/berkebun */}
        <g>
          <circle cx="300" cy="208" r="9" fill="#d9a87f" />
          <path d="M290 220c0-6 4-10 10-10s10 4 10 12l-2 22h-16Z" fill="#1f9d55" />
          <rect x="294" y="252" width="6" height="14" rx="3" fill="#173a30" />
          <rect x="302" y="252" width="6" height="14" rx="3" fill="#173a30" />
          <path d="M286 230l-12 6" stroke="#d9a87f" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* tunas-tunas kecil di tanah */}
        <g fill="#fff4c2" opacity="0.9">
          <circle cx="120" cy="268" r="2" />
          <circle cx="200" cy="274" r="2" />
          <circle cx="276" cy="270" r="2" />
        </g>

        {/* lengkungan teal gelap di dasar agar menyatu dengan seksi gelap */}
        <path d="M0 288c70-16 130-16 200-16s130 0 200 16v12H0Z" fill="#073d49" />
      </g>
    </svg>
  );
}
