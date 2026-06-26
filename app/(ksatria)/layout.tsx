import { requireRole } from "@/lib/guards";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { USER_ROLE } from "@/lib/prisma-enums";
import { KsatriaNav } from "@/components/ksatria/ksatria-nav";
import { KsatriaTopbar } from "@/components/ksatria/ksatria-topbar";

export default async function KsatriaLayout({ children }: { children: React.ReactNode }) {
  await requireRole([USER_ROLE.KSATRIA_BHUMI]);

  const session = await getSession();
  const unread = session
    ? await prisma.notification.count({ where: { userId: session.user.id, isRead: false } }).catch(() => 0)
    : 0;

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-brand-tint">
      <KsatriaTopbar unread={unread} />
      <main className="flex-1 pb-24">{children}</main>
      <KsatriaNav />
    </div>
  );
}
