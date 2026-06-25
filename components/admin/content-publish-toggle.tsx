"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition disabled:opacity-60 ${isPublished ? "bg-brand-soft text-brand-600" : "bg-slate-100 text-slate-600"}`}
    >
      {loading ? "…" : isPublished ? "Published" : "Draft"}
    </button>
  );
}
