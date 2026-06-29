import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { PICKUP_STATUS, NOTIFICATION_TYPE } from "@/lib/prisma-enums";
import { calcReadinessScore, type ReadinessFlags } from "@/lib/business-rules";
import { notifyUser } from "@/lib/notifications";

function parseReadiness(input: unknown): ReadinessFlags | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  return {
    organik: !!r.organik,
    anorganik: !!r.anorganik,
    residu: !!r.residu,
    b3: !!r.b3,
  };
}

// Warga konfirmasi hadir pada sebuah jadwal → buat PickupRequest.
// Opsional: `readiness` (Cek Kesiapan Sampah) → simpan skor self-assessment.
export const POST = handle(async (req) => {
  const session = await getSessionLike();
  if (!session?.profileId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { scheduleId, readiness } = await req.json();
  if (!scheduleId) return Response.json({ error: "scheduleId wajib" }, { status: 422 });

  const flags = parseReadiness(readiness);
  const readinessScore = flags ? calcReadinessScore(flags) : null;

  const profile = await prisma.userProfile.findUnique({ where: { id: session.profileId } });
  const schedule = await prisma.pickupSchedule.findUnique({ where: { id: scheduleId } });
  if (!schedule) return Response.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });

  const existing = await prisma.pickupRequest.findFirst({
    where: { userId: session.profileId, scheduleId },
  });
  if (existing) {
    // Sudah konfirmasi → izinkan update skor kesiapan saja (mis. warga edit checklist).
    if (readinessScore !== null && existing.readinessScore !== readinessScore) {
      const updated = await prisma.pickupRequest.update({
        where: { id: existing.id },
        data: { readinessScore },
      });
      return Response.json(updated);
    }
    return Response.json(existing);
  }

  const request = await prisma.pickupRequest.create({
    data: {
      userId: session.profileId,
      scheduleId,
      status: PICKUP_STATUS.CONFIRMED,
      address: profile?.address ?? "-",
      instruction: profile?.pickupInstruction ?? null,
      notes: profile?.pickupNote ?? null,
      readinessScore,
    },
  });

  // Beri tahu Ksatria yang ditugaskan bahwa ada KK baru konfirmasi hadir.
  if (schedule.ksatriaId) {
    const ksatria = await prisma.ksatriaProfile.findUnique({
      where: { id: schedule.ksatriaId },
      select: { userId: true },
    });
    const ksatriaUser = ksatria
      ? await prisma.userProfile.findUnique({ where: { id: ksatria.userId }, select: { userId: true } })
      : null;
    const warga = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } });
    if (ksatriaUser?.userId) {
      await notifyUser(ksatriaUser.userId, {
        title: "KK baru konfirmasi 📦",
        body: `${warga?.name ?? "Seorang warga"} siap dijemput. Cek daftar tugasmu.`,
        type: NOTIFICATION_TYPE.PICKUP_NEW_REQUEST,
        refId: request.id,
        url: "/ksatria/tugas",
      }).catch(() => {});
    }
  }

  return Response.json(request, { status: 201 });
});
