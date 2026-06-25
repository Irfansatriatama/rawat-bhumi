import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { homeForRole } from "@/lib/roles";
import { Onboarding } from "@/components/splash/onboarding";

export default async function Home() {
  // Sudah login → langsung ke beranda sesuai role, lewati splash.
  const session = await getSession();
  if (session) {
    const role = (session.user as { role?: string }).role ?? "WARGA";
    redirect(homeForRole(role));
  }

  // Belum login → tampilkan splash / onboarding.
  return <Onboarding />;
}
