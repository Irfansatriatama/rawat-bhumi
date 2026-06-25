"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sprout } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { HeroIllustration } from "@/components/brand/hero-illustration";
import { FeaturePills } from "@/components/brand/feature-pills";
import { Button } from "@/components/ui/loading";

type Slide = { subtitle: string; cardTitle: string; cardSub: string };

const SLIDES: Slide[] = [
  {
    subtitle: "Bersama warga, kita ciptakan lingkungan bersih dan lestari.",
    cardTitle: "Mulai perjalananmu bersama Rawat Bhumi",
    cardSub: "Wujudkan perubahan kecil untuk dampak besar.",
  },
  {
    subtitle: "Jadwalkan pickup, pilah sampah, dan pantau dampaknya langsung.",
    cardTitle: "Kelola sampah jadi lebih mudah",
    cardSub: "Semua dalam satu aplikasi, dari hulu hingga hilir.",
  },
  {
    subtitle: "Kumpulkan poin, tukar hadiah, tumbuh bersama komunitas.",
    cardTitle: "Aksi kecilmu, dampak besar untuk bumi",
    cardSub: "Gabung sekarang dan jadi bagian Ksatria Bhumi.",
  },
];

/**
 * Splash / onboarding Rawat Bhumi — tampil sebelum login pada perangkat mobile.
 * Carousel 3 slide (auto-advance + geser + titik), CTA menuju /login.
 * Pada layar lebar, frame dipusatkan agar tetap selaras dengan tampilan aplikasi.
 */
export function Onboarding() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(false);
  const touchX = useRef<number | null>(null);
  const slide = SLIDES[i];

  // auto-advance
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  function go() {
    setLoading(true);
    router.push("/login");
  }

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) {
      setI((v) => (dx < 0 ? (v + 1) % SLIDES.length : (v - 1 + SLIDES.length) % SLIDES.length));
    }
    touchX.current = null;
  }

  return (
    <main className="min-h-[100dvh] bg-brand-tint">
      <div
        className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-brand-tint shadow-soft sm:my-0"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ====== bagian terang: logo + subjudul ====== */}
        <section className="relative px-6 pt-10 text-center">
          <button
            onClick={go}
            className="press absolute right-5 top-5 text-xs font-medium text-brand-dark/60 hover:text-brand-dark"
          >
            Lewati
          </button>

          {/* ornamen ceklis kecil */}
          <Check size={14} strokeWidth={3} className="absolute right-12 top-12 text-brand-600/70" />
          <Check size={11} strokeWidth={3} className="absolute right-9 top-20 text-brand/70" />

          <div className="flex flex-col items-center">
            <LogoMark size={68} />
            <h1 className="mt-3 text-[2rem] font-bold leading-[1.05] tracking-tight text-brand-dark">
              Rawat
              <br />
              Bhumi
            </h1>
            <p
              key={i}
              className="mt-3 min-h-[2.75rem] max-w-[19rem] text-[15px] font-medium leading-snug text-brand-600 [animation:fade_.4s_ease]"
            >
              {slide.subtitle}
            </p>
          </div>
        </section>

        {/* ====== ilustrasi ====== */}
        <div className="-mt-1">
          <HeroIllustration />
        </div>

        {/* ====== bagian gelap: fitur + titik ====== */}
        <section className="flex-1 bg-brand-deep px-5 pt-5">
          <FeaturePills />

          <div className="mt-5 flex items-center justify-center gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-5 bg-brand" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </section>

        {/* ====== kartu CTA ====== */}
        <section className="rounded-t-[28px] bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-center [box-shadow:0_-12px_30px_-18px_rgb(10_63_52/0.5)]">
          <span className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-brand-600">
            <Sprout size={18} strokeWidth={2.2} />
          </span>
          <h2 key={`t${i}`} className="text-lg font-bold text-brand-dark [animation:fade_.4s_ease]">
            {slide.cardTitle}
          </h2>
          <p key={`s${i}`} className="mt-1 text-sm text-gray-500 [animation:fade_.4s_ease]">
            {slide.cardSub}
          </p>

          <Button onClick={go} loading={loading} className="mt-5 w-full py-3 text-base">
            Mulai Sekarang
            {!loading && <ArrowRight size={18} strokeWidth={2.2} />}
          </Button>
        </section>
      </div>
    </main>
  );
}
