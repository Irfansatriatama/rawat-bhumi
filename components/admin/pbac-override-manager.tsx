"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, IconChip, StatusBadge } from "@/components/ui/primitives";

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
    `rounded-lg px-2.5 py-1 text-xs font-medium transition ${active ? color : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`;

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center gap-3">
        <IconChip icon={ShieldCheck} tone="teal" size={36} />
        <h2 className="font-semibold text-brand-dark">Override Izin per User</h2>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Pilih user, lalu timpa izin default rolenya. <b>DENY</b> selalu menang atas template.
      </p>

      <label className="mb-1 block text-sm font-medium text-gray-700">User</label>
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
              <tr className="border-b border-brand-dark/5">
                <th className="py-2 pr-4 font-medium">Permission</th>
                <th className="py-2 pr-4 font-medium">Efektif</th>
                <th className="py-2 pr-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => {
                const eff = effective(p.key);
                const ov = overrides[p.key];
                return (
                  <tr key={p.key} className="border-b border-brand-dark/5 last:border-0">
                    <td className="py-2 pr-4">
                      <span className="font-mono text-xs text-gray-700">{p.key}</span>
                      <span className="ml-2 text-gray-400">{p.description}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge tone={eff ? "green" : "slate"}>{eff ? "✓ ya" : "— tidak"}</StatusBadge>
                        {ov && <span className="text-xs text-brand-amber">(override {ov})</span>}
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-1">
                        <button onClick={() => setEffect(p.key, "DEFAULT")} className={btn(!ov, "bg-brand-dark text-white")}>
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
    </Card>
  );
}
