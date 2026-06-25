import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { SCHEDULE_STATUS } from "@/lib/prisma-enums";

export const GET = handle(async () => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.PICKUP_VIEW.key);
  const schedules = await prisma.pickupSchedule.findMany({
    orderBy: { scheduledDate: "desc" },
    take: 100,
    include: { rt: { include: { rw: true } }, ksatria: true, _count: { select: { pickupRequests: true } } },
  });
  return Response.json(schedules);
});

export const POST = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.PICKUP_CREATE.key);
  const { rtId, scheduledDate, timeSlot, ksatriaId } = await req.json();
  if (!rtId || !scheduledDate || !timeSlot) {
    return Response.json({ error: "rtId, scheduledDate, timeSlot wajib" }, { status: 422 });
  }
  const schedule = await prisma.pickupSchedule.create({
    data: {
      rtId,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      ksatriaId: ksatriaId || null,
      status: SCHEDULE_STATUS.SCHEDULED,
    },
  });
  return Response.json(schedule, { status: 201 });
});
