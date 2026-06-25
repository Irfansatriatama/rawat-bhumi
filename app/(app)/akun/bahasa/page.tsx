import { Globe } from "lucide-react";
import { AppHeader } from "@/components/ui/app-header";
import { Card } from "@/components/ui/primitives";
import { LanguageSelect } from "@/components/akun/language-select";

export default function BahasaPage() {
  return (
    <div>
      <AppHeader title="Bahasa" subtitle="Pilih bahasa aplikasi" icon={Globe} />
      <div className="p-5">
        <Card className="px-4 py-1">
          <LanguageSelect />
        </Card>
        <p className="mt-3 px-1 text-[11px] text-gray-400">
          Saat ini aplikasi tersedia dalam Bahasa Indonesia. Bahasa lain akan ditambahkan bertahap.
        </p>
      </div>
    </div>
  );
}
