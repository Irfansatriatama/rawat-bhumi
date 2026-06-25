import { Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { listByRole } from "@/lib/users";
import { USER_ROLE } from "@/lib/prisma-enums";
import { UserCreateForm } from "@/components/admin/user-create-form";
import { Card, SectionTitle, EmptyState, StatusBadge, PageHeading } from "@/components/ui/primitives";

type Row = Awaited<ReturnType<typeof listByRole>>[number];

function Table({ title, rows, showKsatria }: { title: string; rows: Row[]; showKsatria?: boolean }) {
  return (
    <div>
      <SectionTitle>
        {title} <span className="font-normal text-gray-400">({rows.length})</span>
      </SectionTitle>
      {rows.length === 0 ? (
        <EmptyState icon={Users} title="Belum ada data" hint="Tambahkan akun melalui formulir di atas." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-brand-dark/5 text-left text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">RT</th>
                  {showKsatria && <th className="px-4 py-3 font-medium">Kendaraan</th>}
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-brand-dark/5 last:border-0">
                    <td className="px-4 py-3 font-medium text-brand-dark">{r.name}</td>
                    <td className="px-4 py-3 text-gray-500">{r.email}</td>
                    <td className="px-4 py-3 text-gray-500">{r.rt ? `RT ${r.rt.number}` : "-"}</td>
                    {showKsatria && (
                      <td className="px-4 py-3 text-gray-500">{r.ksatriaProfile?.vehicleType ?? "-"}</td>
                    )}
                    <td className="px-4 py-3">
                      <StatusBadge tone={r.isActive ? "green" : "slate"}>
                        {r.isActive ? "Aktif" : "Nonaktif"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default async function UsersPage() {
  const [warga, ksatria, rts] = await Promise.all([
    listByRole(USER_ROLE.WARGA),
    listByRole(USER_ROLE.KSATRIA_BHUMI),
    prisma.rT.findMany({ include: { rw: true }, orderBy: { number: "asc" } }),
  ]);
  const rtOptions = rts.map((rt) => ({ id: rt.id, label: `RT ${rt.number} / RW ${rt.rw.number}` }));

  return (
    <div>
      <PageHeading
        title="Warga & Ksatria"
        subtitle="Kelola akun warga (Penjaga Bhumi) & Ksatria Bhumi."
      />

      <div className="space-y-6">
        <UserCreateForm rtOptions={rtOptions} />
        <Table title="Warga" rows={warga} />
        <Table title="Ksatria Bhumi" rows={ksatria} showKsatria />
      </div>
    </div>
  );
}
