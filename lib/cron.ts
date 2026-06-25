/** Validasi panggilan cron Vercel via Authorization: Bearer $CRON_SECRET. */
export function assertCron(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
