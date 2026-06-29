import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS } from "@/lib/prisma-enums";

const PLANS: string[] = [SUBSCRIPTION_PLAN.RUMAH_TANGGA, SUBSCRIPTION_PLAN.PREMIUM];

// Pilih Paket (onboarding) → buat/ubah langganan warga.
export const POST = handle(async (req) => {
  const session = await getSessionLike();
  if (!session?.profileId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  if (!PLANS.includes(plan)) return Response.json({ error: "Paket tidak valid" }, { status: 422 });

  const now = new Date();
  const nextBill = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  await prisma.subscription.upsert({
    where: { userId: session.profileId },
    update: { plan },
    create: {
      userId: session.profileId,
      plan,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      startDate: now,
      nextBillDate: nextBill,
    },
  });

  return Response.json({ ok: true, plan });
});
