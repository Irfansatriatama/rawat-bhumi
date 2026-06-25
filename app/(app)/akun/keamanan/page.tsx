import { ShieldCheck, KeyRound, LogOut } from "lucide-react";
import { AppHeader } from "@/components/ui/app-header";
import { Card } from "@/components/ui/primitives";
import { PasswordForm } from "@/components/akun/password-form";
import { LogoutButton } from "@/components/auth/logout-button";

export default function KeamananPage() {
  return (
    <div>
      <AppHeader title="Keamanan Akun" subtitle="Jaga akunmu tetap aman" icon={ShieldCheck} />
      <div className="space-y-4 p-5">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-brand-soft">
              <KeyRound size={18} className="text-brand-600" />
            </span>
            <h2 className="text-sm font-bold text-brand-dark">Ubah Password</h2>
          </div>
          <PasswordForm />
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-brand-dark">Sesi & perangkat</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Mengubah password akan otomatis mengeluarkan akun dari perangkat lain. Keluar dari perangkat ini di bawah.
          </p>
          <LogoutButton className="press mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-brand-red ring-1 ring-brand-red/15">
            <LogOut size={16} /> Keluar dari perangkat ini
          </LogoutButton>
        </Card>
      </div>
    </div>
  );
}
