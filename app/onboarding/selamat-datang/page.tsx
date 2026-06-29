import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, CalendarClock, UserCog, Truck, MessageCircle, ChevronRight } from "lucide-react";
import { getSessionLike } from "@/lib/session";
import { prisma } from "@/lib/db";
import { USER_ROLE, SCHEDULE_STATUS } from "@/lib/prisma-enums";
import { tanggal } from "@/lib/format";

export default async function SelamatDatangPage() {
  const session = await getSessionLike();
  if (!session?.profileId) redirect("/daftar");

  const profile = await prisma.userProfile.findUnique({
    where: { id: session.profileId },
    include: { rt: { include: { rw: { include: { kelurahan: true } } } } },
  });
  if (!profile?.rtId || !profile.rt) redirect("/onboarding/komunitas");

  const [ketua, schedule] = await Promise.all([
    prisma.userProfile.findFirst({ where: { rtId: profile.rtId, role: USER_ROLE.ADMIN_RT } }),
    prisma.pickupSchedule.findFirst({
      where: { rtId: profile.rtId, status: { in: [SCHEDULE_STATUS.SCHEDULED, SCHEDULE_STATUS.IN_PROGRESS] } },
      orderBy: { scheduledDate: "asc" },
      include: { ksatria: { include: { userProfile: true } } },
    }),
  ]);
  const ketuaUser = ketua ? await prisma.user.findUnique({ where: { id: ketua.userId }, select: { name: true } }) : null;
  const ksatriaUser = schedule?.ksatria ? await prisma.user.findUnique({ where: { id: schedule.ksatria.userId }, select: { name: true } }) : null;

  const rows = [
    { icon: MapPin, label: "Wilayah", value: `RT ${profile.rt.number} / RW ${profile.rt.rw.number}, ${profile.rt.rw.kelurahan.name}` },
    { icon: CalendarClock, label: "Jadwal pickup", value: schedule ? `${tanggal(schedule.scheduledDate)} · ${schedule.timeSlot} WIB` : "Akan diumumkan" },
    { icon: UserCog, label: "Ketua RT", value: ketuaUser?.name ?? "Pengurus RT" },
    { icon: Truck, label: "Ksatria Bhumi", value: ksatriaUser?.name ?? "Akan ditugaskan" },
  ];

  return (
    <main className="min-h-[100dvh] bg-brand-tint">
      <div className="app-header rounded-b-[28px] px-6 pb-10 pt-14 text-center text-white">
        <p className="text-4xl">🎉</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Selamat datang di komunitas!</h1>
        <p className="mt-1.5 text-sm text-white/75">Kamu resmi jadi Penjaga Bhumi. Berikut info komunitasmu.</p>
      </div>

      <div className="p-5">
        <div className="divide-y divide-brand-dark/5 rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-brand-dark/5">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} className="flex items-center gap-3 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-600">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">{r.label}</p>
                  <p className="text-sm font-semibold text-brand-dark">{r.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <a href="https://wa.me/628111222333" className="press mt-3 flex items-center justify-center gap-2 rounded-2xl bg-brand-soft py-3 text-sm font-semibold text-brand-600">
          <MessageCircle size={16} /> WhatsApp Operator
        </a>

        <Link href="/beranda" className="press mt-2 flex items-center justify-center gap-2 rounded-2xl bg-brand-dark py-3.5 text-sm font-semibold text-white">
          Mulai Jelajahi Aplikasi <ChevronRight size={17} />
        </Link>
      </div>
    </main>
  );
}
