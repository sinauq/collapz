import Fastify from "fastify";
import cors from "@fastify/cors";

import { noteRoutes } from "./routes/notes.js";

const app = Fastify({
  logger: true,
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
