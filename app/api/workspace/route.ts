import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { documents, events } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { evaluate, injection, redact, seeds } from "@/lib/engine";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return json({ error: "Sign in to open your private workspace." }, 401);
    const db = getDb();
    await db
      .insert(documents)
      .values(seeds.map((s) => ({ ...s, owner: user.userId })))
      .onConflictDoNothing();
    const sources = await db.select().from(documents).where(eq(documents.owner, user.userId));
    const history = await db
      .select()
      .from(events)
      .where(eq(events.owner, user.userId))
      .orderBy(desc(events.created))
      .limit(50);
    return json({
      user: { name: user.fullName || "Your workspace" },
      sources: sources.map(({ owner, ...s }) => ({
        ...s,
        content:
          s.access === "Restricted"
            ? "Content withheld by access policy."
            : s.status === "Quarantined"
              ? "Content withheld: suspicious instructions detected."
              : redact(s.content),
      })),
      history: history.map(({ owner, ...e }) => e),
    });
  } catch (e) {
    console.error("Workspace load failed", e instanceof Error ? e.message : "Unknown");
    return json({ error: "The workspace could not load. Please retry." }, 503);
  }
}
export async function POST(req: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return json({ error: "Sign in required." }, 401);
    const origin = req.headers.get("origin");
    if (!origin || origin !== new URL(req.url).origin)
      return json({ error: "Cross-origin request rejected." }, 403);
    if (!req.headers.get("content-type")?.includes("application/json"))
      return json({ error: "JSON required." }, 415);
    if (Number(req.headers.get("content-length") || 0) > 30000)
      return json({ error: "Request too large." }, 413);
    const raw = await req.text();
    if (raw.length > 30000) return json({ error: "Request too large." }, 413);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: "Invalid JSON." }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body))
      return json({ error: "A JSON object is required." }, 400);
    const db = getDb();
    const owner = user.userId;
    if (body.action === "ask") {
      if (typeof body.question !== "string" || !body.question.trim() || body.question.length > 1200)
        return json({ error: "Enter a question between 1 and 1,200 characters." }, 400);
      const start = Date.now();
      const sources = await db.select().from(documents).where(eq(documents.owner, owner));
      const result = evaluate(body.question.trim(), sources);
      const id = crypto.randomUUID();
      await db.insert(events).values({
        id,
        owner,
        question:
          result.outcome === "Blocked"
            ? "[Sensitive request withheld]"
            : redact(body.question.trim()),
        outcome: result.outcome,
        detail: JSON.stringify(result),
        created: new Date().toISOString(),
      });
      return json({ ...result, id, elapsed: Date.now() - start });
    }
    if (body.action === "add") {
      if (
        typeof body.title !== "string" ||
        body.title.trim().length < 3 ||
        body.title.length > 120 ||
        typeof body.content !== "string" ||
        body.content.trim().length < 20 ||
        body.content.length > 20000 ||
        !["Wiki", "SQL", "API"].includes(body.kind)
      )
        return json(
          {
            error:
              "Provide a title (3–120 characters), content (20–20,000 characters), and a supported source type.",
          },
          400,
        );
      const existing = await db
        .select({ id: documents.id })
        .from(documents)
        .where(eq(documents.owner, owner));
      if (existing.length >= 100)
        return json({ error: "This demo supports up to 100 sources." }, 409);
      await db.insert(documents).values({
        id: crypto.randomUUID(),
        owner,
        title: redact(body.title.trim()),
        content: body.content.trim(),
        kind: body.kind,
        status: injection.test(body.content) ? "Quarantined" : "Unverified",
        access: "Internal",
        updated: new Date().toISOString().slice(0, 10),
        enabled: 1,
      });
      return json({ ok: true });
    }
    if (["toggle", "verify"].includes(body.action) && typeof body.id === "string") {
      const [source] = await db
        .select()
        .from(documents)
        .where(and(eq(documents.owner, owner), eq(documents.id, body.id)));
      if (!source) return json({ error: "Source not found." }, 404);
      if (body.action === "verify") {
        if (
          source.access === "Restricted" ||
          injection.test(source.content) ||
          source.status === "Quarantined"
        )
          return json({ error: "Restricted or quarantined sources cannot be approved." }, 403);
        await db
          .update(documents)
          .set({ status: "Verified", updated: new Date().toISOString().slice(0, 10) })
          .where(and(eq(documents.owner, owner), eq(documents.id, body.id)));
      } else
        await db
          .update(documents)
          .set({ enabled: source.enabled ? 0 : 1 })
          .where(and(eq(documents.owner, owner), eq(documents.id, body.id)));
      return json({ ok: true });
    }
    return json({ error: "Unsupported action." }, 400);
  } catch (e) {
    console.error("Workspace action failed", e instanceof Error ? e.message : "Unknown");
    return json({ error: "Could not complete the action. Please retry." }, 503);
  }
}
