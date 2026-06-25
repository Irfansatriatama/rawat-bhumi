// Wrapper route handler: tangkap Response yang dilempar (mis. dari
// requirePermission → 401/403) dan kembalikan apa adanya; error lain → 500.
type Ctx = { params?: Promise<Record<string, string>> };

export function handle(fn: (req: Request, ctx: Ctx) => Promise<Response>) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof Response) return e;
      console.error("[api]", e);
      return Response.json({ error: "Internal error" }, { status: 500 });
    }
  };
}
