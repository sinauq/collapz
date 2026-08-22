import { FastifyPluginAsync } from "fastify";
import { db } from "../db/index.js";
import { noteLinks } from "../db/schema.ts";

export const linkRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/api/makeLink?source=:source_id&target=:target_id",
    async (req, res) => {
      const { source_id, target_id } = req.params;

      const [link] = await db
        .insert(noteLinks)
        .values({
          source_id,
          target_id,
        })
        .returning();
    },
  );
};
