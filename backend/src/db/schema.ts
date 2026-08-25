import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  blocks: text("blocks").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  owner: integer("owner_id").references(() => users.id),
});

export const noteLinks = pgTable(
  "note_links",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    sourceId: integer("source_id")
      .references(() => notes.id)
      .notNull(),
    targetId: integer("target_id")
      .references(() => notes.id)
      .notNull(),
    relationship: text("relationship").notNull(),
  },
  (table) => [
    unique("source_target_unique_link").on(table.sourceId, table.targetId),
    check("source_taget_not_same", sql`${table.sourceId} <> ${table.targetId}`),
  ],
);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name"),
  role: text("role"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const comments = pgTable("comments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  owner: integer("owner_id").references(() => users.id),
});
