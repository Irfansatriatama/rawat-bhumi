import { headers } from "next/headers";
import { auth } from "./auth";
import type { SessionLike } from "./authz";

/** Session lengkap (incl. role & profileId dari customSession) di server. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Bentuk ringkas untuk requirePermission(). */
export async function getSessionLike(): Promise<SessionLike | null> {
  const s = await getSession();
  if (!s) return null;
  const u = s.user as { role?: string; profileId?: string | null };
  return { userId: s.user.id, role: u.role ?? "WARGA", profileId: u.profileId ?? null };
}
