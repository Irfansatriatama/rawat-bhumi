import { User } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { AppHeader } from "@/components/ui/app-header";
import { Card } from "@/components/ui/primitives";
import { ProfilForm } from "@/components/akun/profil-form";

export default async function ProfilPage() {
  const session = await getSession();
  const profile = await prisma.userProfile.findUnique({ where: { userId: session!.user.id } });

  return (
    <div>
      <AppHeader title="Profil Saya" subtitle="Kelola data pribadi kamu" icon={User} />
      <div className="p-5">
        <Card className="p-5">
          <ProfilForm
            initialName={session!.user.name ?? ""}
            initialPhone={profile?.phone ?? ""}
            email={session!.user.email ?? ""}
          />
        </Card>
      </div>
    </div>
  );
}
