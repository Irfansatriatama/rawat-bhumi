import { prisma } from "./db";
import { getSessionLike } from "./session";
import { calcKsatriaEarning } from "./business-rules";

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

function todayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/** Ringkasan tugas hari ini untuk dashboard Ksatria. */
export async function ksatriaTodayStats(ksatriaId: string) {
  const { start, end } = todayBounds();
  const [open, recsToday] = await Promise.all([
    openRequestsForKsatria(ksatriaId).then((r) => r.length),
    prisma.wasteRecord.findMany({
      where: { ksatriaId, recordedAt: { gte: start, lte: end } },
      select: { totalGrams: true },
    }),
  ]);
  const gramsToday = recsToday.reduce((a, b) => a + b.totalGrams, 0);
  const earning = calcKsatriaEarning(recsToday.length, gramsToday);
  return { open, doneToday: recsToday.length, kgToday: gramsToday / 1000, estToday: earning.totalAmount };
}

type Stop = { id: string; name: string; phone: string | null; address: string; rt: string; date: Date; status: string };

/** Rute hari kerja: KK siap dijemput + nama/telepon/alamat (untuk navigasi & hubungi). */
export async function routeStopsForKsatria(ksatriaId: string): Promise<Stop[]> {
  const reqs = await openRequestsForKsatria(ksatriaId);
  const profiles = await prisma.userProfile.findMany({
    where: { id: { in: reqs.map((r) => r.userId) } },
    select: { id: true, userId: true, phone: true },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: profiles.map((p) => p.userId) } },
    select: { id: true, name: true },
  });
  const nameByUser = new Map(users.map((u) => [u.id, u.name]));
  const byProfile = new Map(profiles.map((p) => [p.id, { name: nameByUser.get(p.userId) ?? "-", phone: p.phone }]));
  return reqs.map((r) => ({
    id: r.id,
    name: byProfile.get(r.userId)?.name ?? "-",
    phone: byProfile.get(r.userId)?.phone ?? null,
    address: r.address,
    rt: r.schedule.rt.number,
    date: r.schedule.scheduledDate,
    status: r.status,
  }));
}

/** Setoran yang sudah ditimbang Ksatria hari ini (recap). */
export async function weighedTodayByKsatria(ksatriaId: string) {
  const { start, end } = todayBounds();
  const recs = await prisma.wasteRecord.findMany({
    where: { ksatriaId, recordedAt: { gte: start, lte: end } },
    orderBy: { recordedAt: "desc" },
  });
  const profiles = await prisma.userProfile.findMany({
    where: { id: { in: recs.map((r) => r.userId) } },
    select: { id: true, userId: true },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: profiles.map((p) => p.userId) } },
    select: { id: true, name: true },
  });
  const userByProfile = new Map(profiles.map((p) => [p.id, p.userId]));
  const nameByUser = new Map(users.map((u) => [u.id, u.name]));
  return recs.map((r) => ({
    id: r.id,
    name: nameByUser.get(userByProfile.get(r.userId) ?? "") ?? "-",
    totalGrams: r.totalGrams,
    recordedAt: r.recordedAt,
  }));
}
