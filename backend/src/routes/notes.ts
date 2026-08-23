import { eq } from "drizzle-orm";
import { FastifyPluginAsync } from "fastify";

import { db } from "../db/index.js";
import { noteLinks, notes } from "../db/schema.ts";
import {
  createNoteSchema,
  noteParamsSchema,
  updateNoteSchema,
} from "../schemas/notes.ts";

export const noteRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/notes", async () => {
    return db.select().from(notes);
  });

  app.get("/api/notes/:id", async (req, res) => {
    const { id } = noteParamsSchema.parse(req.params);
    const [note] = await db
      .select()
      .from(notes)
      .where(eq(notes.id, Number(id)));

    const backLinks = await db
      .select({
        relationship: noteLinks.relationship,
        id: notes.id,
        title: notes.title,
        content: notes.content,
      })
      .from(noteLinks)
      .innerJoin(notes, eq(noteLinks.sourceId, notes.id))
      .where(eq(noteLinks.targetId, id));

    const forwardLinks = await db
      .select({
        relationship: noteLinks.relationship,
        id: notes.id,
        title: notes.title,
        content: notes.content,
      })
      .from(noteLinks)
      .innerJoin(notes, eq(noteLinks.targetId, notes.id))
      .where(eq(noteLinks.sourceId, id));

    return note
      ? res.code(200).send({
          ...note,
          relationships: {
            backLinks: backLinks ?? [],
            forwardLinks: forwardLinks ?? [],
          },
        })
      : res.code(404).send({
          error: "Note not found.",
          data: { id },
        });
  });

  app.post("/api/notes", async (req, res) => {
    const body = createNoteSchema.parse(req.body);

    const [note] = await db
      .insert(notes)
      .values({
        title: body.title,
        content: body.content,
      })
      .returning();

    return res.code(201).send(note);
  });

  app.patch("/api/notes/:id", async (req, res) => {
    const { id } = noteParamsSchema.parse(req.params);
    const body = updateNoteSchema.parse(req.body);
    const [note] = await db
      .update(notes)
      .set({
        ...body,
        updateAt: new Date(),
      })
      .where(eq(Number(id), notes.id))
      .returning();

    return note
      ? note
      : res.code(404).send({
          error: "Note not found.",
          data: { id },
        });
  });

  app.delete("/api/notes/:id", async (req, res) => {
    const { id } = noteParamsSchema.parse(req.params);
    const [note] = await db
      .delete(notes)
      .where(eq(Number(id), notes.id))
      .returning();

    return note
      ? res.code(204).send()
      : res.code(404).send({
          error: "Note not found.",
          data: { id },
        });
  });
};
