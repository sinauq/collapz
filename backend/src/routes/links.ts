import { eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

import { db } from "../db/index.ts";
import { noteLinks, notes } from "../db/schema.ts";
import {
  createNoteLink,
  idParamsScheme,
  linkParams,
  updateNoteLink,
} from "../schemas/notes.ts";

export const linkRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/notes/:id/links", async (req, res) => {
    const { id } = idParamsScheme.parse(req.params);

    const [note] = await db.select().from(notes).where(eq(notes.id, id));

    if (!note) {
      return res.code(404).send({
        error: "no node by that ID exists.",
      });
    }

    const backLinks = await db
      .select()
      .from(noteLinks)
      .where(eq(noteLinks.targetId, id));

    const forwardLinks = await db
      .select()
      .from(noteLinks)
      .where(eq(noteLinks.sourceId, id));

    return res.code(200).send({ backLinks, forwardLinks });
  });

  app.post("/api/notes/:id/links", async (req, res) => {
    const { id } = idParamsScheme.parse(req.params);
    const { targetId, relationship } = createNoteLink.parse(req.body);

    if (id === targetId) {
      return res.code(400).send({
        error: "Node cannot link to itself",
      });
    }

    const [sourceQueriedId] = await db
      .select({ id: notes.id })
      .from(notes)
      .where(eq(notes.id, id));

    if (!sourceQueriedId) {
      return res.code(404).send({
        error: "Source does not exist.",
      });
    }

    const [targetQuereiedId] = await db
      .select({ id: notes.id })
      .from(notes)
      .where(eq(notes.id, targetId));

    if (!targetQuereiedId) {
      return res.code(404).send({
        error: "Target does not exist.",
      });
    }

    const [link] = await db
      .insert(noteLinks)
      .values({
        sourceId: id,
        targetId,
        relationship,
      })
      .returning();

    return res.code(201).send(link);
  });

  app.patch("/api/notes/:id/links/:linkId", async (req, res) => {
    const { id, linkId } = linkParams.parse(req.params);
    const { relationship } = updateNoteLink.parse(req.body);

    const [link] = await db
      .update(noteLinks)
      .set({
        relationship,
      })
      .where(eq(noteLinks.id, linkId))
      .returning();

    return link
      ? link
      : res.code(404).send({
          error: "No such link exists",
          data: { id, linkId },
        });
  });

  app.delete("/api/notes/:id/links/:linkId", async (req, res) => {
    const { id, linkId } = linkParams.parse(req.params);
    const { targetId } = createNoteLink.parse(req.body);

    const [link] = await db
      .delete(noteLinks)
      .where(eq(noteLinks.id, linkId))
      .returning();

    return link
      ? res.code(204).send()
      : res.code(404).send({
          error: "No such link exists",
          data: { targetId, sourceId: id },
        });
  });
};
