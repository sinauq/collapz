import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updateAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});
