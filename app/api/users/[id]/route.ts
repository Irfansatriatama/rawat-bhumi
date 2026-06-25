import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";

export const PATCH = handle(async (req, ctx) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.USER_MANAGE.key);

  const { id } = await ctx.params!;
  const body = await req.json();
  const data: { role?: string; rtId?: string | null; isActive?: boolean } = {};
  if (body.role !== undefined) data.role = body.role;
  if (body.rtId !== undefined) data.rtId = body.rtId || null;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const updated = await prisma.userProfile.update({ where: { id }, data });
  return Response.json(updated);
});
