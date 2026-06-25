import { Coins, Gift, Sparkles, ArrowUpRight, ArrowDownRight, History } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";
import { tanggalJam } from "@/lib/format";
import { RedeemButton } from "@/components/app/redeem-button";
import { AppHeader } from "@/components/ui/app-header";
import { Card, IconChip, EmptyState } from "@/components/ui/primitives";

export default async function PoinPage() {
  const session = await getSessionLike();
  const [profile, history, rewards] = await Promise.all([
    session?.profileId ? prisma.userProfile.findUnique({ where: { id: session.profileId } }) : null,
    session?.profileId
      ? prisma.pointHistory.findMany({ where: { userId: session.profileId }, orderBy: { createdAt: "desc" }, take: 50 })
      : [],
    prisma.reward.findMany({ where: { isActive: true }, orderBy: { pointsCost: "asc" } }),
  ]);
  const points = profile?.totalPoints ?? 0;

  return (
    <div>
      <AppHeader title="Poin & Reward" subtitle="Kumpulkan, tukar, beri dampak" icon={Sparkles} />

      <div className="space-y-5 p-5">
        {/* Hero poin */}
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-brand-600 to-brand-dark p-5 text-white [box-shadow:var(--shadow-pop)]">
          <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
          <Sparkles className="pointer-events-none absolute right-5 top-5 text-brand-lime/40" size={28} />
          <div className="relative flex items-center gap-1.5 text-white/80">
            <Coins size={16} />
            <p className="text-xs font-medium">Total poin kamu</p>
          </div>
          <p className="relative mt-1 text-4xl font-bold tracking-tight">{points.toLocaleString("id-ID")}</p>
          <p className="relative mt-0.5 text-xs text-white/70">Tukar poin dengan reward di bawah</p>
        </div>

        {/* Katalog reward */}
        <section>
          <h2 className="mb-2.5 px-1 text-sm font-bold text-brand-dark">Katalog Reward</h2>
          {rewards.length === 0 ? (
            <EmptyState icon={Gift} title="Belum ada reward" hint="Reward yang bisa ditukar akan tampil di sini." />
          ) : (
            <div className="space-y-3">
              {rewards.map((r) => {
                const cantAfford = points < r.pointsCost;
                const noStock = r.stock <= 0;
                return (
                  <Card key={r.id} className="flex items-center gap-3 p-4">
                    <IconChip icon={Gift} tone={cantAfford || noStock ? "slate" : "green"} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-brand-dark">{r.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-600">
                        <Coins size={12} /> {r.pointsCost.toLocaleString("id-ID")} poin
                        <span className="text-gray-400">· stok {r.stock}</span>
                      </p>
                    </div>
                    <RedeemButton rewardId={r.id} disabled={cantAfford || noStock} />
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Riwayat poin */}
        <section>
          <div className="mb-2.5 flex items-center gap-1.5 px-1">
            <History size={15} className="text-brand-dark" />
            <h2 className="text-sm font-bold text-brand-dark">Riwayat Poin</h2>
          </div>
          {history.length === 0 ? (
            <EmptyState icon={History} title="Belum ada aktivitas" hint="Poin yang masuk dan keluar akan tercatat di sini." />
          ) : (
            <Card className="divide-y divide-brand-dark/5 px-4">
              {history.map((h) => {
                const plus = h.points >= 0;
                return (
                  <div key={h.id} className="flex items-center gap-3 py-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${plus ? "bg-brand-soft" : "bg-red-100"}`}>
                      {plus ? <ArrowUpRight size={16} className="text-brand-600" /> : <ArrowDownRight size={16} className="text-brand-red" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-brand-dark">{h.description}</p>
                      <p className="text-[11px] text-gray-400">{tanggalJam(h.createdAt)}</p>
                    </div>
                    <span className={`shrink-0 text-sm font-bold ${plus ? "text-brand-600" : "text-brand-red"}`}>
                      {plus ? "+" : ""}{h.points.toLocaleString("id-ID")}
                    </span>
                  </div>
                );
              })}
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
