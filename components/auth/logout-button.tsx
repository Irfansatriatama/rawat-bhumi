"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/loading";

export function LogoutButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      aria-busy={pending || undefined}
      className={`inline-flex items-center justify-center gap-2 disabled:opacity-60 ${
        className ?? "text-sm text-white/80 hover:text-white"
      }`}
      onClick={() =>
        startTransition(async () => {
          await signOut();
          router.push("/login");
          router.refresh();
        })
      }
    >
      {pending && <Spinner size={15} />}
      {children ?? "Keluar"}
    </button>
  );
}
