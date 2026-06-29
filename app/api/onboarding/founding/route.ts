import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";

function genReferral(): string {
  const s = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RB${s}`;
}

// Wilayah tidak ditemukan → warga jadi Founding Member (pelopor).
// Buat hierarki wilayah (find-or-create) + RT non-aktif, set warga sbg pelopor.
export const POST = handle(async (req) => {
  const session = await getSessionLike();
  if (!session?.profileId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { kelurahan, kota, rw, rt, address } = await req.json();
  if (!kelurahan || !rw || !rt) {
    return Response.json({ error: "kelurahan, rw, rt wajib" }, { status: 422 });
  }

  const kelName = String(kelurahan).trim();
  const kotaName = String(kota ?? "Jakarta Selatan").trim();
  const rwNo = String(rw).trim();
  const rtNo = String(rt).trim();

  // find-or-create Kelurahan → RW → RT (RT baru = belum aktif).
  let kel = await prisma.kelurahan.findFirst({ where: { name: kelName, kota: kotaName } });
  if (!kel) kel = await prisma.kelurahan.create({ data: { name: kelName, kota: kotaName } });

  let rwRow = await prisma.rW.findFirst({ where: { kelurahanId: kel.id, number: rwNo } });
  if (!rwRow) rwRow = await prisma.rW.create({ data: { kelurahanId: kel.id, number: rwNo } });

  let rtRow = await prisma.rT.findFirst({ where: { rwId: rwRow.id, number: rtNo } });
  if (!rtRow) {
    rtRow = await prisma.rT.create({ data: { rwId: rwRow.id, number: rtNo, isActive: false, foundingTarget: 50 } });
  }

  // Referral code unik untuk pelopor.
  let code = genReferral();
  for (let i = 0; i < 5; i++) {
    const taken = await prisma.userProfile.findUnique({ where: { referralCode: code } });
    if (!taken) break;
    code = genReferral();
  }

  await prisma.userProfile.update({
    where: { id: session.profileId },
    data: {
      rtId: rtRow.id,
      isProvisional: true,
      referralCode: code,
      address: address ? String(address).trim() : undefined,
    },
  });

  return Response.json({ ok: true, rtId: rtRow.id, referralCode: code, active: rtRow.isActive });
});
