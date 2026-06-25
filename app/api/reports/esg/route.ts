import { handle } from "@/lib/api";
import { getSessionLike } from "@/lib/session";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { computeEsgData, generateESGReport } from "@/lib/esg";
import { currentPeriod } from "@/lib/format";

export const GET = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.REPORT_ESG_GENERATE.key);
  const period = new URL(req.url).searchParams.get("period") ?? currentPeriod();
  return Response.json(await computeEsgData(period));
});

export const POST = handle(async (req) => {
  const session = await getSessionLike();
  await requirePermission(session, PERMISSIONS.REPORT_ESG_GENERATE.key);
  const { period } = await req.json();
  const report = await generateESGReport(period ?? currentPeriod(), session!.profileId ?? session!.userId);
  return Response.json(report, { status: 201 });
});
