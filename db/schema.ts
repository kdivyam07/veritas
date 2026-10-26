import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
export const documents = sqliteTable(
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
  (t) => [primaryKey({ columns: [t.id, t.owner] })],
);
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  question: text("question").notNull(),
  outcome: text("outcome").notNull(),
  detail: text("detail").notNull(),
  created: text("created").notNull(),
});
