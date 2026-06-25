import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { BottomNav } from "@/components/ui/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-brand-tint">
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
