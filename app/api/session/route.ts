import { endWorkspaceSession } from "@/lib/session";
import { isSameOrigin } from "@/lib/request-origin";
export const runtime = "nodejs";
export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) {
    return Response.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  await endWorkspaceSession();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
