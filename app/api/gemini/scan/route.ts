import { handle } from "@/lib/api";
import { getSessionLike } from "@/lib/session";
import { scanWaste } from "@/lib/gemini";

export const POST = handle(async (req) => {
  const session = await getSessionLike();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { imageBase64 } = await req.json();
  if (!imageBase64) return Response.json({ error: "imageBase64 wajib" }, { status: 422 });

  const result = await scanWaste(imageBase64);
  return Response.json(result);
});
