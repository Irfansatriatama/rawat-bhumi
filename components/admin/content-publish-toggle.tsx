"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/loading";

export function ContentPublishToggle({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch(`/api/content/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !isPublished }),
        });
        setLoading(false);
        router.refresh();
      }}
      className={`inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition disabled:opacity-60 ${isPublished ? "bg-brand-soft text-brand-600" : "bg-slate-100 text-slate-600"}`}
    >
      {loading && <Spinner size={12} />}
      {isPublished ? "Published" : "Draft"}
    </button>
  );
}
