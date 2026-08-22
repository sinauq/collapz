import cors from "@fastify/cors";
import Fastify from "fastify";
import { ZodError } from "zod";

import { noteRoutes } from "./routes/notes.js";

const app = Fastify({
  logger: true,
});

app.setErrorHandler((err, req, res) => {
  if (err instanceof ZodError) {
    return res.code(400).send({
      error: "validation failed",
      details: err.issues,
    });
  }

  req.log.error(err);

  return res.code(500).send({
    error: "Internal server error",
    // message: err.issues,
  });
});

await app.register(cors, {
  origin: "http://localhost:5173",
});

await app.register(noteRoutes);

app.get("/api/health", async () => {
  return { status: "ok" };
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
