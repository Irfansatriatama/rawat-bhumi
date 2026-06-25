import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Project ini akar workspace-nya sendiri (ada package-lock.json lain di home dir).
  turbopack: { root: __dirname },
  // Izinkan akses resource dev (chunk JS/HMR) dari HP via IP LAN saat `next dev`.
  allowedDevOrigins: ["192.168.1.7"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
