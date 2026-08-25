import cors from "@fastify/cors";
import Fastify from "fastify";
import { ZodError } from "zod";

import { noteRoutes } from "./routes/notes.ts";
import { linkRoutes } from "./routes/links.ts";
import { userRoutes } from "./routes/users.ts";

export function isPostgresError(
  error: unknown,
): error is { cause: { code: string } } {
  return (
    error !== null &&
    typeof error === "object" &&
    "cause" in error &&
    typeof error.cause === "object"
  );
}

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.setErrorHandler((err, req, res) => {
    if (isPostgresError(err) && err.cause.code === "23505") {
      return res.code(409).send({
        error: "Link between the nodes already exist.",
      });
    }

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
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  });

  await app.register(noteRoutes);

  await app.register(linkRoutes);

  await app.register(userRoutes);

  console.log("Server routes: ", app.printRoutes());
  app.get("/api/health", async () => {
    return { status: "ok" };
  });

  return app;
}
