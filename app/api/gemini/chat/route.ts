import { handle } from "@/lib/api";
import { getSessionLike } from "@/lib/session";
import { chatEdukasi } from "@/lib/gemini";

export const POST = handle(async (req) => {
  const session = await getSessionLike();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await req.json();
  if (!message) return Response.json({ error: "message wajib" }, { status: 422 });

  const reply = await chatEdukasi(String(message));
  return Response.json({ reply });
});
