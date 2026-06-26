import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { setKsatriaDuty } from "@/lib/ksatria";

// Ksatria memperbarui status bertugas (online/libur) miliknya sendiri.
export const PATCH = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.WASTE_CREATE.key);

  const kp = session?.profileId
    ? await prisma.ksatriaProfile.findUnique({ where: { userId: session.profileId } })
    : null;
  if (!kp) return Response.json({ error: "Bukan akun Ksatria" }, { status: 403 });

  const body = await req.json();
  if (typeof body.isOnDuty !== "boolean") {
    return Response.json({ error: "isOnDuty (boolean) wajib" }, { status: 422 });
  }

  const updated = await setKsatriaDuty(kp.id, body.isOnDuty);
  return Response.json({ isOnDuty: updated.isOnDuty });
});
