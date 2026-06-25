"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Spinner } from "@/components/ui/loading";
import { updateAlamat } from "@/app/(app)/akun/actions";

const field = "w-full rounded-xl border border-brand-dark/10 bg-white px-3.5 py-3 text-sm text-brand-dark outline-none focus:border-brand-600";

export function AlamatForm({ initialAddress }: { initialAddress: string }) {
  const router = useRouter();
  const [address, setAddress] = useState(initialAddress);
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    const res = await updateAlamat({ address });
    if (res.success) {
      setState("done");
      router.refresh();
      setTimeout(() => setState("idle"), 2000);
    } else {
      setState("idle");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-500">Alamat lengkap penjemputan</label>
        <textarea
          className={`${field} min-h-28 resize-none`}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Jl. ... No. ..., RT / RW, patokan rumah"
        />
        <p className="mt-1 text-[11px] text-gray-400">Alamat ini dipakai kurir saat penjemputan sampah.</p>
      </div>

      <button
        type="submit"
        disabled={state === "saving"}
        className="press flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {state === "saving" && <Spinner size={16} />}
        {state === "done" && <Check size={16} strokeWidth={3} />}
        {state === "done" ? "Tersimpan" : state === "saving" ? "Menyimpan…" : "Simpan alamat"}
      </button>
    </form>
  );
}
