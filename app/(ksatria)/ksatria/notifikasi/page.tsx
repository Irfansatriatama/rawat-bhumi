import { getSession } from "@/lib/session";
import { listNotifications } from "@/lib/notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { MarkReadOnView } from "@/components/notifications/mark-read-on-view";

export default async function KsatriaNotifikasiPage() {
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
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-brand-dark">Notifikasi</h2>
        <p className="text-sm text-gray-500">Tugas baru & info penjemputan.</p>
      </div>
      <MarkReadOnView hasUnread={hasUnread} />
      <NotificationList items={items} />
    </div>
  );
}
