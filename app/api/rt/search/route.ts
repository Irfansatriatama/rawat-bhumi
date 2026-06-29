import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";

// Cari komunitas (RT aktif) by nomor RT / RW / nama kelurahan.
export const GET = handle(async (req) => {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();

  const rts = await prisma.rT.findMany({
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              { number: { contains: q, mode: "insensitive" } },
              { rw: { number: { contains: q, mode: "insensitive" } } },
              { rw: { kelurahan: { name: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    include: {
      rw: { include: { kelurahan: true } },
      _count: { select: { userProfiles: true } },
    },
    take: 20,
    orderBy: { number: "asc" },
  });

  return Response.json(
    rts.map((rt) => ({
      id: rt.id,
      number: rt.number,
      rw: rt.rw.number,
      kelurahan: rt.rw.kelurahan.name,
      kota: rt.rw.kelurahan.kota,
      members: rt._count.userProfiles,
    })),
  );
});
