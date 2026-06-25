import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";

export const POST = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.CONTENT_MANAGE.key);
  const { title, body, targetRole } = await req.json();
  if (!title || !body) return Response.json({ error: "title & body wajib" }, { status: 422 });
  const created = await prisma.announcement.create({
    data: { title, body, targetRole: targetRole || null, isPublished: true, publishedAt: new Date() },
  });
  return Response.json(created, { status: 201 });
});
