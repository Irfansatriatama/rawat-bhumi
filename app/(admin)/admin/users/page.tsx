import { prisma } from "@/lib/db";
import { listByRole } from "@/lib/users";
import { USER_ROLE } from "@/lib/prisma-enums";
import { UserCreateForm } from "@/components/admin/user-create-form";

type Row = Awaited<ReturnType<typeof listByRole>>[number];

function Table({ title, rows, showKsatria }: { title: string; rows: Row[]; showKsatria?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-3 font-semibold text-brand-dark">
        {title} <span className="text-sm font-normal text-gray-400">({rows.length})</span>
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">Belum ada data.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr className="border-b border-black/5">
                <th className="py-2 pr-4">Nama</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">RT</th>
                {showKsatria && <th className="py-2 pr-4">Kendaraan</th>}
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-black/5 last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-800">{r.name}</td>
                  <td className="py-2 pr-4 text-gray-600">{r.email}</td>
                  <td className="py-2 pr-4 text-gray-600">{r.rt ? `RT ${r.rt.number}` : "-"}</td>
                  {showKsatria && (
                    <td className="py-2 pr-4 text-gray-600">{r.ksatriaProfile?.vehicleType ?? "-"}</td>
                  )}
                  <td className="py-2 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        r.isActive ? "bg-green-100 text-brand-dark" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-dark">Warga & Ksatria</h1>
        <p className="text-sm text-gray-500">Kelola akun warga (Penjaga Bhumi) & Ksatria Bhumi.</p>
      </div>
      <UserCreateForm rtOptions={rtOptions} />
      <Table title="Warga" rows={warga} />
      <Table title="Ksatria Bhumi" rows={ksatria} showKsatria />
    </div>
  );
}
