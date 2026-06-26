import { prisma } from "./db";
import { getSessionLike } from "./session";
import { calcKsatriaEarning } from "./business-rules";
import { PICKUP_STATUS, SCHEDULE_STATUS, NOTIFICATION_TYPE } from "./prisma-enums";
import { sendPushToUser } from "./push";

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

type Stop = {
  id: string; name: string; phone: string | null; address: string;
  instruction: string | null; notes: string | null;
  rt: string; date: Date; status: string;
};

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
    instruction: r.instruction,
    notes: r.notes,
    rt: r.schedule.rt.number,
    date: r.schedule.scheduledDate,
    status: r.status,
  }));
}

/** Detail satu tugas (pickup request) untuk halaman detail Ksatria. Null bila bukan tugasnya. */
export async function getTaskDetail(requestId: string, ksatriaId: string) {
  const req = await prisma.pickupRequest.findUnique({
    where: { id: requestId },
    include: {
      schedule: { include: { rt: { include: { rw: { include: { kelurahan: true } } } } } },
      wasteRecord: true,
    },
  });
  if (!req || req.schedule.ksatriaId !== ksatriaId) return null;

  const profile = await prisma.userProfile.findUnique({
    where: { id: req.userId },
    select: { userId: true, phone: true },
  });
  const user = profile
    ? await prisma.user.findUnique({ where: { id: profile.userId }, select: { name: true } })
    : null;

  const rt = req.schedule.rt;
  return {
    id: req.id,
    name: user?.name ?? "-",
    phone: profile?.phone ?? null,
    address: req.address,
    instruction: req.instruction,
    notes: req.notes,
    status: req.status,
    rt: rt.number,
    rw: rt.rw.number,
    kelurahan: rt.rw.kelurahan.name,
    kota: rt.rw.kelurahan.kota,
    date: req.schedule.scheduledDate,
    timeSlot: req.schedule.timeSlot,
    wasteRecord: req.wasteRecord,
  };
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

// Status yang boleh di-set Ksatria dari lapangan (COMPLETED otomatis saat timbang).
const KSATRIA_SETTABLE = [PICKUP_STATUS.ON_THE_WAY, PICKUP_STATUS.ARRIVED] as string[];

const STATUS_NOTIF: Record<string, { title: string; body: string; type: string }> = {
  [PICKUP_STATUS.ON_THE_WAY]: {
    title: "Kurir dalam perjalanan 🚚",
    body: "Kurir sedang menuju lokasimu. Siapkan sampah terpilahmu ya.",
    type: NOTIFICATION_TYPE.PICKUP_ON_THE_WAY,
  },
  [PICKUP_STATUS.ARRIVED]: {
    title: "Kurir tiba di lokasi 📍",
    body: "Kurir sudah sampai di titik pickup-mu.",
    type: NOTIFICATION_TYPE.PICKUP_REMINDER,
  },
};

/**
 * Ksatria menandai progres penjemputan (ON_THE_WAY / ARRIVED).
 * Verifikasi kepemilikan (request milik jadwal yang di-assign ke ksatria),
 * lalu update status + notifikasi/push ke warga. Lempar Response untuk error.
 */
export async function setRequestStatusByKsatria(requestId: string, ksatriaId: string, status: string) {
  if (!KSATRIA_SETTABLE.includes(status)) {
    throw new Response("Status tidak valid", { status: 422 });
  }
  const req = await prisma.pickupRequest.findUnique({
    where: { id: requestId },
    include: { schedule: true },
  });
  if (!req) throw new Response("Pickup request tidak ditemukan", { status: 404 });
  if (req.schedule.ksatriaId !== ksatriaId) throw new Response("Bukan tugasmu", { status: 403 });
  if (req.status === PICKUP_STATUS.COMPLETED || req.status === PICKUP_STATUS.CANCELLED) {
    throw new Response("Penjemputan sudah selesai", { status: 409 });
  }

  // Notification.userId = Better Auth user.id (bukan UserProfile.id).
  const warga = await prisma.userProfile.findUnique({
    where: { id: req.userId },
    select: { userId: true },
  });
  const notif = STATUS_NOTIF[status];

  await prisma.$transaction(async (tx) => {
    await tx.pickupRequest.update({ where: { id: requestId }, data: { status } });
    if (status === PICKUP_STATUS.ON_THE_WAY && req.schedule.status === SCHEDULE_STATUS.SCHEDULED) {
      await tx.pickupSchedule.update({
        where: { id: req.scheduleId },
        data: { status: SCHEDULE_STATUS.IN_PROGRESS },
      });
    }
    if (warga?.userId && notif) {
      await tx.notification.create({
        data: { userId: warga.userId, title: notif.title, body: notif.body, type: notif.type, refId: req.id },
      });
    }
  });

  if (warga?.userId && notif) {
    await sendPushToUser(warga.userId, {
      title: notif.title,
      body: notif.body,
      url: "/pickup/tracking",
      refId: req.id,
    }).catch(() => {});
  }

  return { id: req.id, status };
}

/** Toggle status bertugas Ksatria + perbarui lastActiveAt. */
export async function setKsatriaDuty(ksatriaId: string, isOnDuty: boolean) {
  return prisma.ksatriaProfile.update({
    where: { id: ksatriaId },
    data: { isOnDuty, lastActiveAt: new Date() },
  });
}
