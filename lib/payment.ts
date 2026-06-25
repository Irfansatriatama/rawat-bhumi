import { prisma } from "./db";
import { currentPeriod } from "./format";
import { PAYMENT_STATUS, REVENUE_SOURCE, ENTRY_TYPE, SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS } from "./prisma-enums";

export const IURAN_AMOUNT = 50000; // Rp 50.000/KK/bulan

const isDummy = (process.env.PAYMENT_PROVIDER ?? "dummy") === "dummy";

/** Adapter QRIS — mode dummy mengembalikan string QR palsu. */
export function createQris(amount: number, ref: string) {
  if (isDummy) return { externalId: `dummy-${ref}`, qrString: `QRIS-DUMMY|${ref}|Rp${amount}` };
  throw new Error("Payment provider asli belum dikonfigurasi");
}

function nextMonth(from = new Date()) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d;
}

/** Tandai pembayaran LUNAS + catat ke revenue ledger (IURAN) + majukan tagihan. */
export async function markPaymentPaid(paymentId: string, method?: string) {
  return prisma.$transaction(async (tx) => {
    const p = await tx.subscriptionPayment.findUnique({ where: { id: paymentId } });
    if (!p) throw new Response("Pembayaran tidak ditemukan", { status: 404 });
    if (p.status === PAYMENT_STATUS.PAID) return p;

    const updated = await tx.subscriptionPayment.update({
      where: { id: paymentId },
      data: { status: PAYMENT_STATUS.PAID, paidAt: new Date(), method: method ?? p.method },
    });
    await tx.revenueEntry.create({
      data: {
        source: REVENUE_SOURCE.IURAN,
        type: ENTRY_TYPE.REVENUE,
        amount: p.amount,
        period: currentPeriod(),
        note: `Iuran warga (payment ${p.id})`,
      },
    });
    await tx.subscription.update({
      where: { id: p.subscriptionId },
      data: { nextBillDate: nextMonth(), status: SUBSCRIPTION_STATUS.ACTIVE },
    });
    return updated;
  });
}

/** Buat tagihan iuran periode berjalan untuk semua warga aktif (idempoten per periode). */
export async function generateInvoices(amount = IURAN_AMOUNT) {
  const wargas = await prisma.userProfile.findMany({ where: { role: "WARGA", isActive: true } });
  const period = currentPeriod();
  let created = 0;

  for (const w of wargas) {
    let sub = await prisma.subscription.findUnique({ where: { userId: w.id } });
    if (!sub) {
      sub = await prisma.subscription.create({
        data: {
          userId: w.id,
          plan: SUBSCRIPTION_PLAN.RUMAH_TANGGA,
          status: SUBSCRIPTION_STATUS.ACTIVE,
          startDate: new Date(),
          nextBillDate: nextMonth(),
        },
      });
    }
    const existing = await prisma.subscriptionPayment.findFirst({
      where: { subscriptionId: sub.id, externalId: `period:${period}` },
    });
    if (existing) continue;

    await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: sub.id,
        amount,
        method: "PENDING",
        status: PAYMENT_STATUS.PENDING,
        externalId: `period:${period}`,
      },
    });
    created++;
  }
  return { created, period };
}
