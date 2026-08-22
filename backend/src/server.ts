import Fastify from "fastify";
import cors from "@fastify/cors";

import { db } from "./db/index.js";
import { notes } from "./db/schema.js";

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: "http://localhost:5173",
});

app.get("/api/health", async () => {
  return { status: "ok" };
});

app.post(
  "/api/notes",
  {
    schema: {
      body: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: { type: "string", nullable: false },
          content: { type: "string" },
        },
      },
    },
  },
  async (req, res) => {
    const body = req.body as {
      title: string;
      content: string;
    };

    const [note] = await db
      .insert(notes)
      .values({
        title: body.title,
        content: body.content,
      })
      .returning();

    return res.code(201).send(note);
  },
);

app.get("/api/notes", async () => {
  return db.select().from(notes);
});

try {
  await app.listen({
    port: 3000,
    host: "0.0.0.0",
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
