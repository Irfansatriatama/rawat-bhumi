// Util kecil untuk video YouTube — dipakai pemutar embed & thumbnail materi Belajar.
// Mendukung URL bentuk: watch?v=, youtu.be/, /embed/, /shorts/.

/** Ambil video ID dari berbagai bentuk URL YouTube. null bila bukan YouTube. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(?:embed|shorts|v)\/([^/?]+)/);
      if (m) return m[1];
    }
  } catch {
    // bukan URL absolut — coba pola id polos (11 char)
    const m = String(url).match(/^[\w-]{11}$/);
    if (m) return m[0];
  }
  return null;
}

/** URL embed privacy-enhanced; autoplay opsional saat pemutar di-klik. */
export function youtubeEmbed(id: string, autoplay = true): string {
  const q = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${q.toString()}`;
}

/** Thumbnail resmi YouTube. hqdefault selalu tersedia (480x360). */
export function youtubeThumb(id: string, quality: "hq" | "max" = "hq"): string {
  return `https://i.ytimg.com/vi/${id}/${quality === "max" ? "maxresdefault" : "hqdefault"}.jpg`;
}
