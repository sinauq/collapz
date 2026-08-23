import { sql } from "drizzle-orm";
import { FastifyPluginAsync } from "fastify";

import { db } from "../db/index.js";
import { notes, noteLinks } from "../db/schema.ts";
import { noteParamsSchema, createNoteLink } from "../schemas/notes.ts";

export const linkRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/notes/:id/links", async (req, res) => {
    const { id } = noteParamsSchema.parse(req.params);

    const [note] = await db.select().from(notes);

    if (!note) {
      return res.code(404).send({
        error: "no node by that ID exists.",
      });
    }

    const [backLinks] = await db
      .select()
      .from(noteLinks)
      .where(sql`target_id = ${id}`);

    const [forwardLinks] = await db
      .select()
      .from(noteLinks)
      .where(sql`source_id = ${id}`);

    return res.code(200).send({ backLinks, forwardLinks });
  });

  app.post("/api/notes/:id/links", async (req, res) => {
    const { id } = noteParamsSchema.parse(req.params);
    const { targetId, relationship } = createNoteLink.parse(req.body);

    const [sourceQueriedId] = await db
      .select()
      .from(noteLinks)
      .where(sql`source_id = ${id}`);

    const [targetQuereiedId] = await db
      .select()
      .from(noteLinks)
      .where(sql`target_id = ${targetId}`);

    if (id == targetId) {
      return res.code(400).send({
        error: "Node cannot link to itself",
      });
    }

    if (!sourceQueriedId || !targetQuereiedId) {
      return res.code(400).send({
        error: "Source or target does not exist.",
      });
    }

    const [link] = await db
      .insert(noteLinks)
      .values({
        sourceId: Number(id),
        targetId,
        relationship,
      })
      .returning();

    return res.code(201).send(link);
  });
};
