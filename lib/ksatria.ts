import { prisma } from "./db";
import { getSessionLike } from "./session";

export async function getKsatriaProfile() {
  const session = await getSessionLike();
  if (!session?.profileId) return null;
  return prisma.ksatriaProfile.findUnique({ where: { userId: session.profileId } });
}

const OPEN_STATUSES = ["PENDING", "CONFIRMED", "ON_THE_WAY", "ARRIVED"];

export async function openRequestsForKsatria(ksatriaId: string) {
  return prisma.pickupRequest.findMany({
    where: { status: { in: OPEN_STATUSES }, schedule: { ksatriaId } },
    include: { schedule: { include: { rt: true } } },
    orderBy: { createdAt: "desc" },
  });
}
