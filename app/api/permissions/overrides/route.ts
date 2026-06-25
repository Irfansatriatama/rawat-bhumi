import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { ROLE_TEMPLATE } from "@/lib/permissions";

// GET ?profileId= → { role, template, overrides }
export const GET = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.ROLE_MANAGE.key);

  const profileId = new URL(req.url).searchParams.get("profileId");
  if (!profileId) return Response.json({ error: "profileId wajib" }, { status: 422 });

  const profile = await prisma.userProfile.findUnique({ where: { id: profileId } });
  if (!profile) return Response.json({ error: "Profil tidak ditemukan" }, { status: 404 });

  const overrides = await prisma.userPermissionOverride.findMany({ where: { userId: profileId } });
  return Response.json({
    role: profile.role,
    template: ROLE_TEMPLATE[profile.role] ?? [],
    overrides,
  });
});

// POST { profileId, permissionKey, effect: "GRANT"|"DENY" } → upsert
export const POST = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.ROLE_MANAGE.key);

  const { profileId, permissionKey, effect } = await req.json();
  if (!profileId || !permissionKey || !["GRANT", "DENY"].includes(effect)) {
    return Response.json({ error: "profileId, permissionKey, effect(GRANT|DENY) wajib" }, { status: 422 });
  }
  const ov = await prisma.userPermissionOverride.upsert({
    where: { userId_permissionKey: { userId: profileId, permissionKey } },
    update: { effect },
    create: { userId: profileId, permissionKey, effect },
  });
  return Response.json(ov, { status: 201 });
});

// DELETE ?profileId=&permissionKey= → balik ke default template
export const DELETE = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.ROLE_MANAGE.key);

  const url = new URL(req.url);
  const profileId = url.searchParams.get("profileId");
  const permissionKey = url.searchParams.get("permissionKey");
  if (!profileId || !permissionKey) {
    return Response.json({ error: "profileId & permissionKey wajib" }, { status: 422 });
  }
  await prisma.userPermissionOverride.deleteMany({ where: { userId: profileId, permissionKey } });
  return Response.json({ success: true });
});
