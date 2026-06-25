"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as unknown as { MSStream?: unknown }).MSStream
    );
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) return null;

  return (
    <div>
      <h3>Pasang Aplikasi</h3>
      {isIOS && (
        <p>
          Untuk memasang di iOS: tap tombol Share (⎋) lalu &quot;Add to Home Screen&quot; (➕).
        </p>
      )}
    </div>
  );
}
