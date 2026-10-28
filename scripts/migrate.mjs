import { readFile, readdir, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
const directory = new URL("../migrations/postgres/", import.meta.url);
const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
const migrations = await Promise.all(
  files.map(async (name) => ({ name, sql: await readFile(new URL(name, directory), "utf8") })),
);
if (process.env.DATABASE_URL) {
  const { neon } = await import("@neondatabase/serverless");
  const client = neon(process.env.DATABASE_URL);
  for (const migration of migrations) {
    for (const statement of migration.sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean))
      await client.query(statement);
    console.log(`Schema ready: ${migration.name}`);
  }
} else {
  if (process.env.VERCEL) throw new Error("DATABASE_URL is required on Vercel.");
  const { PGlite } = await import("@electric-sql/pglite");
  const location = process.env.LOCAL_DATABASE_PATH || ".data/veritas";
  await mkdir(dirname(resolve(location)), { recursive: true });
  const client = new PGlite(location);
  try {
    for (const migration of migrations) {
      await client.exec(migration.sql);
      console.log(`Schema ready: ${migration.name}`);
    }
  } finally {
    await client.close();
  }
}
console.log("Workspace PostgreSQL schema is ready.");
