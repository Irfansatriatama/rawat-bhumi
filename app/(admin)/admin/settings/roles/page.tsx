import { requireRole } from "@/lib/guards";
import { USER_ROLE } from "@/lib/prisma-enums";
import { ALL_PERMISSIONS, ROLE_TEMPLATE } from "@/lib/permissions";
import { listAllProfiles } from "@/lib/users";
import { PbacOverrideManager } from "@/components/admin/pbac-override-manager";

export default async function RolesPage() {
  // Hanya admin tinggi yang boleh kelola PBAC (punya role.manage).
  await requireRole([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN_KELURAHAN]);

  const profiles = await listAllProfiles();
  const permissions = ALL_PERMISSIONS.map((p) => ({ key: p.key, group: p.group, description: p.description }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-dark">Pengaturan PBAC</h1>
        <p className="text-sm text-gray-500">Template izin per role + override per user.</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 font-semibold text-brand-dark">Template Role (default)</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(ROLE_TEMPLATE).map(([role, keys]) => (
            <div key={role} className="rounded-lg bg-brand-bg p-3">
              <p className="mb-1 font-medium text-brand-dark">{role}</p>
              <p className="text-xs text-gray-500">
                {keys.length === ALL_PERMISSIONS.length ? "Semua izin" : keys.join(", ") || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <PbacOverrideManager profiles={profiles} permissions={permissions} />
    </div>
  );
}
