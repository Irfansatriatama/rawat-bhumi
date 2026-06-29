import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionLike } from "@/lib/session";

// Lengkapi data warga setelah verifikasi OTP: set nama asli (override nama
// sementara = nomor HP) & catat referral Founding Member bila ada.
export const POST = handle(async (req) => {
  const session = await getSessionLike();
  if (!session?.profileId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name, ref } = await req.json();
  const cleanName = typeof name === "string" ? name.trim() : "";
  if (cleanName.length < 2) return Response.json({ error: "Nama wajib diisi" }, { status: 422 });

  await prisma.user.update({ where: { id: session.userId }, data: { name: cleanName } });

  // Referral: kaitkan ke pengajak (founder) bila kode valid & belum tercatat.
  if (typeof ref === "string" && ref.trim()) {
    const inviter = await prisma.userProfile.findUnique({ where: { referralCode: ref.trim() } });
    const me = await prisma.userProfile.findUnique({ where: { id: session.profileId } });
    if (inviter && me && !me.referredById && inviter.id !== me.id) {
      await prisma.userProfile.update({
        where: { id: me.id },
        data: { referredById: inviter.id, rtId: inviter.rtId ?? undefined },
      });
    }
  }

  return Response.json({ ok: true });
});
