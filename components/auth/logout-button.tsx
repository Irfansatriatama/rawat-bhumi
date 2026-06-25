"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function LogoutButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <button
      className={className ?? "text-sm text-white/80 hover:text-white"}
      onClick={async () => {
        await signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      {children ?? "Keluar"}
    </button>
  );
}
