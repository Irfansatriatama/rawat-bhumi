"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Spinner } from "@/components/ui/loading";
import { updateProfil } from "@/app/(app)/akun/actions";

const field = "w-full rounded-xl border border-brand-dark/10 bg-white px-3.5 py-3 text-sm text-brand-dark outline-none focus:border-brand-600";
const label = "mb-1.5 block text-xs font-semibold text-gray-500";

export function ProfilForm({
  initialName,
  initialPhone,
  email,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setMsg(null);
    const res = await updateProfil({ name, phone });
    if (res.success) {
      setState("done");
      router.refresh();
      setTimeout(() => setState("idle"), 2000);
    } else {
      setState("error");
      setMsg(res.error ?? "Gagal menyimpan");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={label}>Nama lengkap</label>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className={label}>Email</label>
        <input className={`${field} cursor-not-allowed bg-brand-tint text-gray-400`} value={email} disabled />
        <p className="mt-1 text-[11px] text-gray-400">Email tidak dapat diubah.</p>
      </div>
      <div>
        <label className={label}>Nomor HP</label>
        <input
          className={field}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08xxxxxxxxxx"
          inputMode="tel"
        />
      </div>

      {msg && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-brand-red">{msg}</p>}

      <button
        type="submit"
        disabled={state === "saving"}
        className="press flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {state === "saving" && <Spinner size={16} />}
        {state === "done" && <Check size={16} strokeWidth={3} />}
        {state === "done" ? "Tersimpan" : state === "saving" ? "Menyimpan…" : "Simpan perubahan"}
      </button>
    </form>
  );
}
