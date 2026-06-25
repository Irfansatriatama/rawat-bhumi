import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { createQris, markPaymentPaid } from "@/lib/payment";
import { PAYMENT_STATUS } from "@/lib/prisma-enums";

// Warga membayar tagihan miliknya. QRIS (dummy) → langsung lunas; CASH → tunggu verifikasi admin.
export const POST = handle(async (req) => {
  const session = await getSessionLike();
  if (!session?.profileId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentId, method } = await req.json();
  const payment = await prisma.subscriptionPayment.findUnique({
    where: { id: paymentId },
    include: { subscription: true },
  });
  if (!payment) return Response.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
  if (payment.subscription.userId !== session.profileId) {
    return Response.json({ error: "Bukan tagihanmu" }, { status: 403 });
  }
  if (payment.status === PAYMENT_STATUS.PAID) return Response.json(payment);

  if (method === "QRIS") {
    const qr = createQris(payment.amount, paymentId);
    const paid = await markPaymentPaid(paymentId, "QRIS");
    return Response.json({ ...paid, qr });
  }

  const updated = await prisma.subscriptionPayment.update({
    where: { id: paymentId },
    data: { method: "CASH" },
  });
  return Response.json(updated);
});
