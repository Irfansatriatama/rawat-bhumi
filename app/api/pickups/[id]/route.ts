import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { requireAnyPermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";

export const PATCH = handle(async (req, ctx) => {
  const session = await getSessionLike();
  await requireAnyPermission(session, [PERMISSIONS.PICKUP_ASSIGN.key, PERMISSIONS.PICKUP_CREATE.key]);

  const { id } = await ctx.params!;
  const body = await req.json();
  const data: { ksatriaId?: string | null; status?: string; notes?: string } = {};
  if (body.ksatriaId !== undefined) data.ksatriaId = body.ksatriaId || null;
  if (body.status !== undefined) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes;

  const updated = await prisma.pickupSchedule.update({ where: { id }, data });
  return Response.json(updated);
});
