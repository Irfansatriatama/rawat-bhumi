import { AlertTriangle } from "lucide-react";
import { AppHeader } from "@/components/ui/app-header";
import { Card } from "@/components/ui/primitives";
import { ReportForm } from "@/components/akun/report-form";

export default function LaporanPage() {
  return (
    <div>
      <AppHeader title="Laporkan Masalah" subtitle="Bantu kami jadi lebih baik" icon={AlertTriangle} />
      <div className="p-5">
        <Card className="p-5">
          <ReportForm />
        </Card>
      </div>
    </div>
  );
}
