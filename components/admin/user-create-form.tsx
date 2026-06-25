"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { USER_ROLE } from "@/lib/prisma-enums";

type RtOption = { id: string; label: string };

const empty = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: USER_ROLE.WARGA as string,
  rtId: "",
  employeeId: "",
  vehicleType: "",
};

export function UserCreateForm({ rtOptions }: { rtOptions: RtOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const isKsatria = form.role === USER_ROLE.KSATRIA_BHUMI;
  const up = (k: keyof typeof empty, v: string) => setForm((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone || null,
      role: form.role,
      rtId: form.rtId || null,
    };
    if (isKsatria) payload.ksatria = { employeeId: form.employeeId, vehicleType: form.vehicleType || null };

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg({ ok: false, text: data.error ?? "Gagal membuat user" });
      return;
    }
    setMsg({ ok: true, text: "User berhasil dibuat." });
    setForm(empty);
    router.refresh();
  }

  const input = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand";

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-4 font-semibold text-brand-dark">Tambah User</h2>
      {msg && (
        <p
          className={`mb-3 rounded-lg px-3 py-2 text-sm ${
            msg.ok ? "bg-green-50 text-brand-dark" : "bg-red-50 text-brand-red"
          }`}
        >
          {msg.text}
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className={input} placeholder="Nama" value={form.name} onChange={(e) => up("name", e.target.value)} required />
        <input className={input} type="email" placeholder="Email" value={form.email} onChange={(e) => up("email", e.target.value)} required />
        <input className={input} type="text" placeholder="Password sementara" value={form.password} onChange={(e) => up("password", e.target.value)} required minLength={8} />
        <input className={input} placeholder="No. HP (opsional)" value={form.phone} onChange={(e) => up("phone", e.target.value)} />
        <select className={input} value={form.role} onChange={(e) => up("role", e.target.value)}>
          <option value={USER_ROLE.WARGA}>Warga</option>
          <option value={USER_ROLE.KSATRIA_BHUMI}>Ksatria Bhumi</option>
          <option value={USER_ROLE.ADMIN_RT}>Admin RT</option>
        </select>
        <select className={input} value={form.rtId} onChange={(e) => up("rtId", e.target.value)}>
          <option value="">— Pilih RT —</option>
          {rtOptions.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.label}
            </option>
          ))}
        </select>
        {isKsatria && (
          <>
            <input className={input} placeholder="ID Pegawai (employeeId)" value={form.employeeId} onChange={(e) => up("employeeId", e.target.value)} required />
            <input className={input} placeholder="Kendaraan (mis. Viar Karya 200)" value={form.vehicleType} onChange={(e) => up("vehicleType", e.target.value)} />
          </>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg bg-brand-dark px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Menyimpan…" : "Simpan"}
      </button>
    </form>
  );
}
