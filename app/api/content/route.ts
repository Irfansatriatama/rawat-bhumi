import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";

export const GET = handle(async () => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.CONTENT_MANAGE.key);
  return Response.json(await prisma.educationContent.findMany({ orderBy: { createdAt: "desc" }, take: 100 }));
});

export const POST = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.CONTENT_MANAGE.key);

  const { title, slug, category, summary, content, isPublished } = await req.json();
  if (!title || !slug || !category || !summary || !content) {
    return Response.json({ error: "title, slug, category, summary, content wajib" }, { status: 422 });
  }
  try {
    const created = await prisma.educationContent.create({
      data: {
        title,
        slug,
        category,
        summary,
        content,
        isPublished: !!isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });
    return Response.json(created, { status: 201 });
  } catch {
    return Response.json({ error: "Slug sudah dipakai" }, { status: 422 });
  }
});
