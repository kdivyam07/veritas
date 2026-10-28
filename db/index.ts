import { neon } from "@neondatabase/serverless";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-http";
import { drizzle as localDrizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

type LocalClient = import("@electric-sql/pglite").PGlite;
const localState = globalThis as typeof globalThis & { veritasLocalDb?: Promise<LocalClient> };

export async function getDb() {
  if (process.env.DATABASE_URL) {
    return neonDrizzle(neon(process.env.DATABASE_URL), { schema });
  }
  if (process.env.VERCEL) {
    throw new Error("DATABASE_URL must be configured before opening a hosted workspace.");
  }
  localState.veritasLocalDb ??= import("@electric-sql/pglite").then(
    ({ PGlite }) => new PGlite(process.env.LOCAL_DATABASE_PATH || ".data/veritas"),
  );
  return localDrizzle(await localState.veritasLocalDb, { schema });
}
