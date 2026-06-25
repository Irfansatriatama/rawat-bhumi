import { Bell } from "lucide-react";
import { PushNotificationManager } from "@/components/pwa/push-notification-manager";
import { AppHeader } from "@/components/ui/app-header";
import { Card } from "@/components/ui/primitives";

export default function NotifikasiPage() {
  return (
    <div>
      <AppHeader title="Pengaturan Notifikasi" subtitle="Atur pemberitahuan pickup & poin" icon={Bell} />
      <div className="p-5">
        <Card className="p-4">
          <PushNotificationManager />
        </Card>
      </div>
    </div>
  );
}
