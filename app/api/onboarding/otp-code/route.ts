import { handle } from "@/lib/api";
import { OTP_DEV_MODE, normalizePhone, getDevCode } from "@/lib/otp-dev";

// DEV ONLY: kembalikan kode OTP terakhir untuk sebuah nomor agar bisa
// ditampilkan di layar onboarding (tanpa SMS). Nonaktif bila OTP_DEV_MODE=false.
export const GET = handle(async (req) => {
  if (!OTP_DEV_MODE) return Response.json({ devMode: false });
  const phone = new URL(req.url).searchParams.get("phone");
  if (!phone) return Response.json({ error: "phone wajib" }, { status: 422 });
  const code = await getDevCode(normalizePhone(phone));
  return Response.json({ devMode: true, code });
});
