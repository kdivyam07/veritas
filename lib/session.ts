import { cookies } from "next/headers";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { sessions } from "@/db/schema";

const COOKIE = "veritas_session";
const MAX_AGE = 30 * 24 * 60 * 60;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

// Opaque 256-bit tokens are stored only in HttpOnly cookies. The database keeps
// their hashes; client-supplied account IDs and former gateway headers are ignored.
export async function getWorkspaceUser(create = false) {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!create && (!token || !/^[a-f0-9]{64}$/.test(token))) return null;
  const db = await getDb();
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.tokenHash, hash(token)));
    if (session && Date.parse(session.expires) > Date.now()) {
      return { userId: session.owner, fullName: null };
    }
  }
  if (!create) return null;
  const nextToken = randomBytes(32).toString("hex");
  const owner = randomUUID();
  await db.insert(sessions).values({
    tokenHash: hash(nextToken),
    owner,
    expires: new Date(Date.now() + MAX_AGE * 1000).toISOString(),
  });
  jar.set(COOKIE, nextToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return { userId: owner, fullName: null };
}

export async function endWorkspaceSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    const db = await getDb();
    await db.delete(sessions).where(eq(sessions.tokenHash, hash(token)));
  }
  jar.set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
