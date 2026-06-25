import { handle } from "@/lib/api";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { generateInvoices } from "@/lib/payment";

export const POST = handle(async () => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.SUBSCRIPTION_MANAGE.key);
  const result = await generateInvoices();
  return Response.json(result, { status: 201 });
});
