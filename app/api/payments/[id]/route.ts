import { handle } from "@/lib/api";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { markPaymentPaid } from "@/lib/payment";

// Admin verifikasi pembayaran tunai → LUNAS + masuk revenue ledger.
export const PATCH = handle(async (req, ctx) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.SUBSCRIPTION_MANAGE.key);
  const { id } = await ctx.params!;
  const paid = await markPaymentPaid(id, "CASH");
  return Response.json(paid);
});
