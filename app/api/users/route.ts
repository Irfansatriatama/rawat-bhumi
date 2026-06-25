import { handle } from "@/lib/api";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { createUserWithProfile, listByRole } from "@/lib/users";
import { USER_ROLE } from "@/lib/prisma-enums";

export const GET = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.USER_MANAGE.key);
  const role = new URL(req.url).searchParams.get("role") ?? USER_ROLE.WARGA;
  return Response.json(await listByRole(role));
});

export const POST = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.USER_MANAGE.key);

  const body = await req.json();
  if (!body.name || !body.email || !body.password || !body.role) {
    return Response.json({ error: "name, email, password, role wajib diisi" }, { status: 422 });
  }
  try {
    const profile = await createUserWithProfile(body);
    return Response.json(profile, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal membuat user";
    return Response.json({ error: msg }, { status: 422 });
  }
});
