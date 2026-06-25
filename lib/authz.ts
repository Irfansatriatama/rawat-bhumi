import { prisma } from "./db";
import { ROLE_TEMPLATE } from "./permissions";

export type SessionLike = { userId: string; role: string; profileId: string | null };

/**
 * PBAC: izin efektif = template role + override per-user (DENY menang).
 * `profileId` = UserProfile.id (kunci UserPermissionOverride.userId).
 */
export async function can(
  profileId: string | null,
  role: string,
  permissionKey: string
): Promise<boolean> {
  const base = new Set(ROLE_TEMPLATE[role] ?? []);
  if (profileId) {
    const overrides = await prisma.userPermissionOverride.findMany({
      where: { userId: profileId, permissionKey },
    });
    for (const o of overrides) {
      if (o.effect === "DENY") return false; // DENY selalu menang
      if (o.effect === "GRANT") base.add(permissionKey);
    }
  }
  return base.has(permissionKey);
}

/** Lempar 401/403 bila tidak berizin. Tangkap via handle() di route handler. */
export async function requirePermission(session: SessionLike | null | undefined, permissionKey: string) {
  if (!session) throw new Response("Unauthorized", { status: 401 });
  if (!(await can(session.profileId, session.role, permissionKey))) {
    throw new Response("Forbidden", { status: 403 });
  }
}

/** Berizin bila punya salah satu dari `keys`. */
export async function requireAnyPermission(session: SessionLike | null | undefined, keys: string[]) {
  if (!session) throw new Response("Unauthorized", { status: 401 });
  for (const k of keys) {
    if (await can(session.profileId, session.role, k)) return;
  }
  throw new Response("Forbidden", { status: 403 });
}
