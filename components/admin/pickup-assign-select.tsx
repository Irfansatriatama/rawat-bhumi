"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Opt = { id: string; label: string };

export function PickupAssignSelect({
  scheduleId,
  ksatriaOptions,
  current,
}: {
  scheduleId: string;
  ksatriaOptions: Opt[];
  current: string | null;
}) {
  const router = useRouter();
  const [val, setVal] = useState(current ?? "");
  const [saving, setSaving] = useState(false);

  async function change(v: string) {
    setVal(v);
    setSaving(true);
    await fetch(`/api/pickups/${scheduleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ksatriaId: v || null }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={val}
      onChange={(e) => change(e.target.value)}
      disabled={saving}
      className="rounded-lg border border-gray-300 px-2 py-1 text-xs outline-none focus:border-brand"
    >
      <option value="">— belum —</option>
      {ksatriaOptions.map((o) => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
  );
}
