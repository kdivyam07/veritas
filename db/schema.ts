import { pgTable, text, integer, primaryKey, index } from "drizzle-orm/pg-core";
export const documents = pgTable(
  "documents",
  {
    id: text("id").notNull(),
    owner: text("owner").notNull(),
    title: text("title").notNull(),
    kind: text("kind").notNull(),
    content: text("content").notNull(),
    status: text("status").notNull(),
    access: text("access").notNull(),
    updated: text("updated").notNull(),
    enabled: integer("enabled").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.id, t.owner] }), index("documents_owner").on(t.owner)],
);
export const events = pgTable("events", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  question: text("question").notNull(),
  outcome: text("outcome").notNull(),
  detail: text("detail").notNull(),
  created: text("created").notNull(),
});
export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  owner: text("owner").notNull(),
  expires: text("expires").notNull(),
});
