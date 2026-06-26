import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import { getSession } from "@/lib/session";
import { listNotifications } from "@/lib/notifications";
import { AppHeader } from "@/components/ui/app-header";
import { NotificationList } from "@/components/notifications/notification-list";
import { MarkReadOnView } from "@/components/notifications/mark-read-on-view";

export default async function NotifikasiPage() {
  const session = await getSession();
  const rows = await listNotifications(session!.user.id);
  const items = rows.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));
  const hasUnread = items.some((n) => !n.isRead);

  return (
    <div>
      <AppHeader
        title="Notifikasi"
        subtitle="Pickup, poin, dan info penting"
        icon={Bell}
        right={
          <Link
            href="/akun/notifikasi"
            className="press grid h-9 w-9 place-items-center rounded-full bg-white/15 ring-1 ring-white/20"
            aria-label="Pengaturan notifikasi"
          >
            <Settings size={18} className="text-white" />
          </Link>
        }
      />
      <MarkReadOnView hasUnread={hasUnread} />
      <div className="p-4">
        <NotificationList items={items} />
      </div>
    </div>
  );
}
