"use client";

import { useState } from "react";
import { Check, Loader2, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const field = "w-full rounded-xl border border-brand-dark/10 bg-white px-3.5 py-3 pr-11 text-sm text-brand-dark outline-none focus:border-brand-600";
const label = "mb-1.5 block text-xs font-semibold text-gray-500";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next.length < 8) return setError("Password baru minimal 8 karakter.");
    if (next !== confirm) return setError("Konfirmasi password tidak cocok.");
    setState("saving");
    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    if (error) {
      setState("idle");
      setError(error.message ?? "Password saat ini salah.");
      return;
    }
    setState("done");
    setCurrent("");
    setNext("");
    setConfirm("");
    setTimeout(() => setState("idle"), 2500);
  }

  const inputs = [
    { lbl: "Password saat ini", val: current, set: setCurrent },
    { lbl: "Password baru", val: next, set: setNext },
    { lbl: "Ulangi password baru", val: confirm, set: setConfirm },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {inputs.map((f) => (
        <div key={f.lbl}>
          <label className={label}>{f.lbl}</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              className={field}
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              tabIndex={-1}
            >
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
      ))}

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-brand-red">{error}</p>}

      <button
        type="submit"
        disabled={state === "saving"}
        className="press flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {state === "saving" && <Loader2 size={16} className="animate-spin" />}
        {state === "done" && <Check size={16} strokeWidth={3} />}
        {state === "done" ? "Password diperbarui" : state === "saving" ? "Menyimpan…" : "Ubah password"}
      </button>
    </form>
  );
}
