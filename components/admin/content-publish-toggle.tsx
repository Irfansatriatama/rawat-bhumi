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
      className={`rounded px-2 py-1 text-xs font-medium ${isPublished ? "bg-green-100 text-brand-dark" : "bg-gray-100 text-gray-500"}`}
    >
      {loading ? "…" : isPublished ? "Published" : "Draft"}
    </button>
  );
}
