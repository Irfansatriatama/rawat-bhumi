import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { POINT_TYPE, REDEMPTION_STATUS } from "@/lib/prisma-enums";

export const POST = handle(async (req) => {
  const session = await getSessionLike();
  if (!session?.profileId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const profileId = session.profileId;
  const { rewardId } = await req.json();

  const result = await prisma.$transaction(async (tx) => {
    const reward = await tx.reward.findUnique({ where: { id: rewardId } });
    if (!reward || !reward.isActive) throw new Response("Reward tidak tersedia", { status: 404 });
    if (reward.stock <= 0) throw new Response("Stok habis", { status: 422 });

    const profile = await tx.userProfile.findUnique({ where: { id: profileId } });
    if (!profile || profile.totalPoints < reward.pointsCost) {
      throw new Response("Poin tidak cukup", { status: 422 });
    }

    await tx.userProfile.update({ where: { id: profile.id }, data: { totalPoints: { decrement: reward.pointsCost } } });
    await tx.pointHistory.create({
      data: {
        userId: profile.id,
        points: -reward.pointsCost,
        type: POINT_TYPE.REDEEMED,
        description: `Tukar reward: ${reward.name}`,
        refId: reward.id,
      },
    });
    await tx.reward.update({ where: { id: reward.id }, data: { stock: { decrement: 1 } } });
    return tx.rewardRedemption.create({
      data: { userId: profile.id, rewardId: reward.id, pointsUsed: reward.pointsCost, status: REDEMPTION_STATUS.PENDING },
    });
  });

  return Response.json(result, { status: 201 });
});
