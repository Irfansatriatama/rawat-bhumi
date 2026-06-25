"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { youtubeEmbed, youtubeThumb } from "@/lib/youtube";

/**
 * Pemutar YouTube ringan (lite-embed): tampilkan thumbnail + tombol play,
 * iframe baru dimuat saat di-klik agar halaman tetap ringan.
 */
export function VideoPlayer({
  videoId,
  title,
  poster,
}: {
  videoId: string;
  title: string;
  poster?: string | null;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-[var(--radius-card)] bg-black [box-shadow:var(--shadow-soft)]">
        <iframe
          src={youtubeEmbed(videoId, true)}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Putar video: ${title}`}
      className="press group relative block aspect-video w-full overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-brand-dark/15 to-brand/15 [box-shadow:var(--shadow-soft)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster || youtubeThumb(videoId)}
        alt={title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <span className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-brand-dark shadow-lg transition-transform group-hover:scale-105">
          <Play size={26} className="ml-1 fill-current" />
        </span>
      </span>
    </button>
  );
}
