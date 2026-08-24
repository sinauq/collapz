import { asc, desc, eq, ilike, or } from "drizzle-orm";
import { FastifyPluginAsync } from "fastify";

import { db } from "../db/index.js";
import { noteLinks, notes } from "../db/schema.ts";
import {
  createNoteSchema,
  idParamsScheme,
  NotesQueryParams,
  notesQueryParams,
  updateNoteSchema,
} from "../schemas/notes.ts";

export const noteRoutes: FastifyPluginAsync = async (app) => {
  // TODO add query params for userId
  app.get("/api/notes", async (req, res) => {
    const { search, sortBy, order }: NotesQueryParams = notesQueryParams.parse(
      req.query,
    );
    const sort = sortBy === "updatedAt" ? notes.updatedAt : notes.createdAt;
    const orderFunction = order == "asc" ? asc(sort) : desc(sort);
    const allNotes = await db
      .select()
      .from(notes)
      .where(
        search
          ? or(
              ilike(notes.title, `%${search}%`),
              ilike(notes.content, `%${search}%`),
            )
          : undefined,
      )
      .orderBy(orderFunction);

    return res.code(200).send(allNotes);
  });

  app.get("/api/notes/:id", async (req, res) => {
    const { id } = idParamsScheme.parse(req.params);
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
        owner: notes.owner,
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
        owner: notes.owner,
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
    const { content, title, owner } = createNoteSchema.parse(req.body);

    const [note] = await db
      .insert(notes)
      .values({
        title,
        content,
        owner,
      })
      .returning();

    return res.code(201).send(note);
  });

  app.patch("/api/notes/:id", async (req, res) => {
    const { id } = idParamsScheme.parse(req.params);
    const body = updateNoteSchema.parse(req.body);
    const [note] = await db
      .update(notes)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning();

    return note
      ? note
      : res.code(404).send({
          error: "Note not found.",
          data: { id },
        });
  });

  // TODO implement delete later
  // app.delete("/api/notes/:id", async (req, res) => {
  //   const { id } = idParamsScheme.parse(req.params);
  //   const [note] = await db.delete(notes).where(eq(notes.id, id)).returning();

  //   return note
  //     ? res.code(204).send()
  //     : res.code(404).send({
  //         error: "Note not found.",
  //         data: { id },
  //       });
  // });
};
