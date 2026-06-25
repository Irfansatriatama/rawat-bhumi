"use client";

import { useState } from "react";

type Perm = { key: string; group: string; description: string };
type Profile = { id: string; name: string; email: string; role: string };

export function PbacOverrideManager({ profiles, permissions }: { profiles: Profile[]; permissions: Perm[] }) {
  const [profileId, setProfileId] = useState("");
  const [role, setRole] = useState("");
  const [template, setTemplate] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function load(id: string) {
    setProfileId(id);
    setOverrides({});
    setTemplate([]);
    setRole("");
    if (!id) return;
    setLoading(true);
    const res = await fetch(`/api/permissions/overrides?profileId=${id}`);
    const d = await res.json();
    if (res.ok) {
      setRole(d.role);
      setTemplate(d.template);
      const ov: Record<string, string> = {};
      d.overrides.forEach((o: { permissionKey: string; effect: string }) => (ov[o.permissionKey] = o.effect));
      setOverrides(ov);
    }
    setLoading(false);
  }

  async function setEffect(key: string, effect: "GRANT" | "DENY" | "DEFAULT") {
    if (effect === "DEFAULT") {
      await fetch(`/api/permissions/overrides?profileId=${profileId}&permissionKey=${key}`, { method: "DELETE" });
      setOverrides((o) => {
        const n = { ...o };
        delete n[key];
        return n;
      });
    } else {
      await fetch("/api/permissions/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, permissionKey: key, effect }),
      });
      setOverrides((o) => ({ ...o, [key]: effect }));
    }
  }

  const effective = (key: string) =>
    overrides[key] === "DENY" ? false : overrides[key] === "GRANT" ? true : template.includes(key);

  const btn = (active: boolean, color: string) =>
    `rounded px-2 py-1 text-xs font-medium ${active ? color : "bg-gray-100 text-gray-500"}`;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-1 font-semibold text-brand-dark">Override Izin per User</h2>
      <p className="mb-4 text-sm text-gray-500">
        Pilih user, lalu timpa izin default rolenya. <b>DENY</b> selalu menang atas template.
      </p>

      <select
        className="mb-4 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
        value={profileId}
        onChange={(e) => load(e.target.value)}
      >
        <option value="">— Pilih user —</option>
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.role} · {p.email}
          </option>
        ))}
      </select>

      {loading && <p className="text-sm text-gray-400">Memuat…</p>}

      {profileId && !loading && (
        <div className="overflow-x-auto">
          <p className="mb-2 text-sm text-gray-500">
            Role: <b className="text-brand-dark">{role}</b>
          </p>
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr className="border-b border-black/5">
                <th className="py-2 pr-4">Permission</th>
                <th className="py-2 pr-4">Efektif</th>
                <th className="py-2 pr-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => {
                const eff = effective(p.key);
                const ov = overrides[p.key];
                return (
                  <tr key={p.key} className="border-b border-black/5 last:border-0">
                    <td className="py-2 pr-4">
                      <span className="font-mono text-xs text-gray-700">{p.key}</span>
                      <span className="ml-2 text-gray-400">{p.description}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={eff ? "text-brand-dark" : "text-gray-400"}>
                        {eff ? "✓ ya" : "�— tidak"}
                        {ov && <span className="ml-1 text-xs text-amber-600">(override {ov})</span>}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-1">
                        <button onClick={() => setEffect(p.key, "DEFAULT")} className={btn(!ov, "bg-gray-700 text-white")}>
                          Default
                        </button>
                        <button onClick={() => setEffect(p.key, "GRANT")} className={btn(ov === "GRANT", "bg-brand text-brand-dark")}>
                          Grant
                        </button>
                        <button onClick={() => setEffect(p.key, "DENY")} className={btn(ov === "DENY", "bg-brand-red text-white")}>
                          Deny
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
