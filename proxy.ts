import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Next.js 16: "middleware" sekarang bernama "proxy" (fungsi sama).
// Sesuai pedoman Next: proxy hanya untuk CEK OPTIMISTIK (baca cookie, TANPA query DB).
// Penegakan role/permission yang sebenarnya dilakukan di layout/route handler
// via getSessionLike() + requirePermission() (PBAC).

const PROTECTED_PREFIXES = ["/admin", "/ksatria", "/beranda", "/pickup", "/belajar", "/komunitas", "/akun"];

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const needsAuth = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
  if (!needsAuth) return NextResponse.next();

  const sessionCookie = getSessionCookie(req);
  if (!sessionCookie) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Jangan jalankan di aset & API
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons|.*\\.png$).*)"],
};
