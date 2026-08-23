import { asc, desc, eq, ilike } from "drizzle-orm";
import { FastifyPluginAsync } from "fastify";

import { db } from "../db/index.js";
import { comments, notes, users } from "../db/schema.ts";
import {
  createUserSchema,
  idParamsScheme,
  updateUserSchema,
  usersQueryParams,
} from "../schemas/notes.ts";

export const userRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/users", async (req, res) => {
    const { search, order } = usersQueryParams.parse(req.query);
    const result = await db
      .select()
      .from(users)
      .where(search ? ilike(users.name, `%${search}%`) : undefined)
      .orderBy(order == "asc" ? asc(users.name) : desc(users.name));

    return res.code(200).send(result);
  });

  app.get("/api/users/:id", async (req, res) => {
    const { id } = idParamsScheme.parse(req.params);
    const [user] = await db.select().from(users).where(eq(users.id, id));

    return user
      ? res.code(200).send(user)
      : res.code(404).send({
          error: "Note not found.",
          data: { id },
        });
  });

  app.get("/api/users/:id/posts", async (req, res) => {
    // TODO a query param to sort by data instead of type
    const { id } = idParamsScheme.parse(req.params);
    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user) {
      return res.code(404).send({
        error: "User not found",
        data: { id },
      });
    }
    const userNotes = await db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
      })
      .from(notes)
      .where(eq(notes.owner, id));

    const userComments = await db
      .select({
        id: comments.id,
        content: comments.content,
      })
      .from(comments)
      .where(eq(comments.owner, id));

    return userNotes || userComments
      ? res.code(200).send({ notes: userNotes, comments: userComments })
      : res.code(404).send({
          error: "User has no notes or comments",
          data: { id },
        });
  });

  app.post("/api/users", async (req, res) => {
    const body = createUserSchema.parse(req.body);

    const [user] = await db
      .insert(users)
      .values({
        name: body.name,
        role: body.role,
      })
      .returning();

    return res.code(201).send(user);
  });

  app.patch("/api/users/:id", async (req, res) => {
    const { id } = idParamsScheme.parse(req.params);
    const body = updateUserSchema.parse(req.body);

    const [user] = await db
      .update(users)
      .set(body)
      .where(eq(users.id, id))
      .returning();

    return user
      ? user
      : res.code(404).send({
          error: "User not found.",
          data: { id },
        });
  });

  // TODO add delete
  // app.delete("/api/notes/:id", async (req, res) => {
  //   const { id } = idParamsScheme.parse(req.params);
  //   const [note] = await db
  //     .delete(notes)
  //     .where(eq(Number(id), notes.id))
  //     .returning();

  //   return note
  //     ? res.code(204).send()
  //     : res.code(404).send({
  //         error: "Note not found.",
  //         data: { id },
  //       });
  // });
};
