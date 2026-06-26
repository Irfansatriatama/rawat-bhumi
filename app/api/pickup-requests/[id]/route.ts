import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { setRequestStatusByKsatria } from "@/lib/ksatria";

// Ksatria menandai progres penjemputan (ON_THE_WAY / ARRIVED).
export const PATCH = handle(async (req, ctx) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.WASTE_CREATE.key);

  const { id } = await ctx.params!;
  const body = await req.json();
  if (!body.status) return Response.json({ error: "status wajib" }, { status: 422 });

  const kp = session?.profileId
    ? await prisma.ksatriaProfile.findUnique({ where: { userId: session.profileId } })
    : null;
  if (!kp) return Response.json({ error: "Bukan akun Ksatria" }, { status: 403 });

  const result = await setRequestStatusByKsatria(id, kp.id, body.status);
  return Response.json(result);
});
