import { UserPlus, MapPin, Users, Sprout } from "lucide-react";
import { getSessionLike } from "@/lib/session";
import { prisma } from "@/lib/db";
import { JOIN_REQUEST_STATUS, USER_ROLE } from "@/lib/prisma-enums";
import { tanggal } from "@/lib/format";
import { JoinRequestActions, AktivasiButton } from "@/components/admin/pengajuan-actions";

export default async function PengajuanPage() {
  const session = await getSessionLike();
  const scoped = session?.role === USER_ROLE.ADMIN_RT;
  const myProfile = session?.profileId
    ? await prisma.userProfile.findUnique({ where: { id: session.profileId }, select: { rtId: true } })
    : null;
  const rtFilter = scoped && myProfile?.rtId ? { rtId: myProfile.rtId } : {};

  const [pending, foundingRts] = await Promise.all([
    prisma.joinRequest.findMany({
      where: { status: JOIN_REQUEST_STATUS.PENDING, ...rtFilter },
      orderBy: { createdAt: "asc" },
      include: { rt: { include: { rw: { include: { kelurahan: true } } } } },
    }),
    prisma.rT.findMany({
      where: { isActive: false, ...(scoped && myProfile?.rtId ? { id: myProfile.rtId } : {}) },
      include: { rw: { include: { kelurahan: true } }, _count: { select: { userProfiles: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Pengajuan & Wilayah</h1>
        <p className="mt-1 text-sm text-gray-500">Setujui anggota baru dan aktifkan wilayah Founding Member.</p>
      </div>

      {/* ===== Aktivasi Wilayah (Founding) ===== */}
      {foundingRts.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-dark">
            <Sprout size={16} className="text-brand-600" /> Wilayah menunggu aktivasi
          </h2>
          <div className="space-y-2">
            {foundingRts.map((rt) => {
              const pct = Math.min(100, Math.round((rt._count.userProfiles / Math.max(1, rt.foundingTarget)) * 100));
              return (
                <div key={rt.id} className="rounded-xl border border-brand-dark/10 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-brand-dark">RT {rt.number} / RW {rt.rw.number}</p>
                      <p className="text-xs text-gray-500">{rt.rw.kelurahan.name}, {rt.rw.kelurahan.kota}</p>
                    </div>
                    <AktivasiButton rtId={rt.id} />
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[11px] text-gray-500">
                      <span>{rt._count.userProfiles} / {rt.foundingTarget} KK pelopor</span>
                      <span className="font-semibold text-brand-600">{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-brand-tint">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.max(3, pct)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== Pengajuan anggota ===== */}
      <section>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-dark">
          <UserPlus size={16} className="text-brand-600" /> Pengajuan bergabung ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-xl border border-dashed border-brand-dark/15 bg-white/60 px-4 py-8 text-center text-sm text-gray-500">
            Tidak ada pengajuan menunggu persetujuan.
          </p>
        ) : (
          <div className="space-y-2">
            {pending.map((jr) => (
              <div key={jr.id} className="rounded-xl border border-brand-dark/10 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-brand-dark">{jr.fullName}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={11} /> {jr.address}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                      <Users size={11} /> RT {jr.rt.number}/RW {jr.rt.rw.number} · {tanggal(jr.createdAt)}
                    </p>
                    {jr.note && <p className="mt-1 text-xs italic text-gray-500">“{jr.note}”</p>}
                  </div>
                  <JoinRequestActions id={jr.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
