import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { requireAnyPermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { createWasteRecord } from "@/lib/waste";

const num = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));

export const POST = handle(async (req) => {
  const session = await getSessionLike();
  await requireAnyPermission(session, [PERMISSIONS.WASTE_CREATE.key, PERMISSIONS.WASTE_CREATE_MANUAL.key]);

  const body = await req.json();
  if (!body.pickupRequestId) return Response.json({ error: "pickupRequestId wajib" }, { status: 422 });

  // Ksatria → ambil profilnya sendiri; Admin manual → boleh kirim ksatriaProfileId.
  let ksatriaProfileId: string | undefined = body.ksatriaProfileId;
  if (!ksatriaProfileId && session?.profileId) {
    const kp = await prisma.ksatriaProfile.findUnique({ where: { userId: session.profileId } });
    ksatriaProfileId = kp?.id;
  }
  if (!ksatriaProfileId) {
    return Response.json({ error: "ksatriaProfileId wajib (input manual admin)" }, { status: 422 });
  }

  const wr = await createWasteRecord({
    pickupRequestId: body.pickupRequestId,
    ksatriaProfileId,
    organikGrams: num(body.organikGrams),
    anorganikGrams: num(body.anorganikGrams),
    residuGrams: num(body.residuGrams),
    b3Grams: num(body.b3Grams),
    weightPhotoUrl: body.weightPhotoUrl ?? null,
    overrideReason: body.overrideReason ?? null,
    syncStatus: body.syncStatus,
  });
  return Response.json(wr, { status: 201 });
});
