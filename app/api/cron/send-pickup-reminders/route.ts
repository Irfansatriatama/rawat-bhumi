import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { assertCron } from "@/lib/cron";
import { NOTIFICATION_TYPE } from "@/lib/prisma-enums";

// Reminder pickup: jadwal 0–3 hari ke depan → Notification untuk warga RT terkait.
export const GET = handle(async (req) => {
  assertCron(req);
  const now = new Date();
  const in3 = new Date(now.getTime() + 3 * 86400000);

  const schedules = await prisma.pickupSchedule.findMany({
    where: { scheduledDate: { gte: now, lte: in3 }, status: "SCHEDULED" },
  });

  let created = 0;
  for (const s of schedules) {
    const wargas = await prisma.userProfile.findMany({ where: { rtId: s.rtId, role: "WARGA", isActive: true } });
    for (const w of wargas) {
      await prisma.notification.create({
        data: {
          userId: w.id,
          title: "Pickup sebentar lagi",
          body: `Jadwal pickup ${new Date(s.scheduledDate).toLocaleDateString("id-ID")} (${s.timeSlot}). Siapkan sampah terpilahmu.`,
          type: NOTIFICATION_TYPE.PICKUP_REMINDER,
          refId: s.id,
        },
      });
      created++;
    }
  }
  return Response.json({ schedules: schedules.length, notifications: created });
});
