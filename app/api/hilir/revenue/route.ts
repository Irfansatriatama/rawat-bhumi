import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { ENTRY_TYPE } from "@/lib/prisma-enums";

export const GET = handle(async () => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.HILIR_REVENUE_VIEW.key);
  const entries = await prisma.revenueEntry.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return Response.json(entries);
});

export const POST = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.HILIR_DELIVERY_CREATE.key);

  const { source, type, amount, weightKg, unitPrice, period, deliveryId, note } = await req.json();
  if (!source || !period || amount === undefined) {
    return Response.json({ error: "source, period, amount wajib" }, { status: 422 });
  }
  const entry = await prisma.revenueEntry.create({
    data: {
      source,
      type: type === ENTRY_TYPE.COST ? ENTRY_TYPE.COST : ENTRY_TYPE.REVENUE,
      amount: Math.round(Number(amount) || 0),
      weightKg: weightKg != null ? Number(weightKg) : null,
      unitPrice: unitPrice != null ? Math.round(Number(unitPrice)) : null,
      period,
      deliveryId: deliveryId || null,
      note: note || null,
    },
  });
  return Response.json(entry, { status: 201 });
});
