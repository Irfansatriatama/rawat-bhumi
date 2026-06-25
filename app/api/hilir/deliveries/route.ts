// Contoh route handler ber-PBAC + validasi routing 4 jalur hilir.
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { assertValidDeliveryRouting } from "@/lib/hilir";
import { DELIVERY_STATUS } from "@/lib/prisma-enums";

export const POST = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.HILIR_DELIVERY_CREATE.key);

  const { partnerId, category, weightKg, deliveryDate, receiptUrl, notes } = await req.json();

  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!partner) return Response.json({ error: "Partner tidak ditemukan" }, { status: 404 });

  // Kunci: kategori harus cocok dengan tipe partner (B3 tak boleh nyasar).
  assertValidDeliveryRouting(category, partner.type);

  const delivery = await prisma.wasteDelivery.create({
    data: {
      partnerId,
      category,
      weightKg,
      deliveryDate: new Date(deliveryDate),
      receiptUrl: receiptUrl ?? null,
      notes: notes ?? null,
      status: DELIVERY_STATUS.DELIVERED,
    },
  });
  return Response.json(delivery, { status: 201 });
});

export const GET = handle(async () => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.HILIR_REVENUE_VIEW.key);

  const deliveries = await prisma.wasteDelivery.findMany({
    orderBy: { deliveryDate: "desc" },
    take: 100,
    include: { partner: true },
  });
  return Response.json(deliveries);
});
