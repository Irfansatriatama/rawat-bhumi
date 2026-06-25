import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";

export const PATCH = handle(async (req, ctx) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.CONTENT_MANAGE.key);
  const { id } = await ctx.params!;
  const { isPublished } = await req.json();
  const updated = await prisma.educationContent.update({
    where: { id },
    data: { isPublished: !!isPublished, publishedAt: isPublished ? new Date() : null },
  });
  return Response.json(updated);
});
