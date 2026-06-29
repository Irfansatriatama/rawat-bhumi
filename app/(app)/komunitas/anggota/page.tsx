import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { USER_ROLE } from "@/lib/prisma-enums";
import { Card, EmptyState } from "@/components/ui/primitives";

export default async function AnggotaPage() {
  const session = await getSession();
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session!.user.id },
    include: { rt: true },
  });

  const members = profile?.rtId
    ? await prisma.userProfile.findMany({
        where: { rtId: profile.rtId, role: USER_ROLE.WARGA },
        orderBy: { isActive: "desc" },
      })
    : [];
  const users = members.length
    ? await prisma.user.findMany({ where: { id: { in: members.map((m) => m.userId) } }, select: { id: true, name: true } })
    : [];
  const nameOf = new Map(users.map((u) => [u.id, u.name]));

  return (
    <div className="min-h-[100dvh] bg-brand-tint pb-6">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-brand-dark/5 bg-white/90 px-4 py-3.5 backdrop-blur-lg">
        <Link href="/komunitas" className="press grid h-9 w-9 place-items-center rounded-full bg-brand-tint">
          <ArrowLeft size={18} className="text-brand-dark" />
        </Link>
        <h1 className="text-base font-bold text-brand-dark">
          Anggota {profile?.rt ? `RT ${profile.rt.number}` : ""}
        </h1>
      </header>

      <div className="p-4">
        {members.length === 0 ? (
          <EmptyState icon={Users} title="Belum ada anggota" hint="Anggota RT akan tampil di sini." />
        ) : (
          <Card className="divide-y divide-brand-dark/5 p-4">
            {members.map((m) => {
              const name = nameOf.get(m.userId) ?? "Warga";
              const initials = name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase();
              return (
                <div key={m.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand-600">
                    {initials}
                  </span>
                  <span className="flex-1 text-sm font-medium text-brand-dark">{name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.isActive ? "bg-brand-soft text-brand-600" : "bg-gray-100 text-gray-400"}`}>
                    {m.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}
