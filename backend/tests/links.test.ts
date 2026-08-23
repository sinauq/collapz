import { beforeAll, afterAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/server.js";

describe("links", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns links for an existing note", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/notes/1/links",
    });

    expect(response.statusCode).toBe(200);
  });

  it("returns 404 for a nonexistent note", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/notes/999999/links",
    });

    expect(response.statusCode).toBe(404);
  });

  it("rejects invalid id", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/notes/1/links",
      payload: {
        targetId: "abs",
        relationship: "relates_to",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejects a self-link", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/notes/1/links",
      payload: {
        targetId: 1,
        relationship: "relates_to",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("has backLink in response", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/notes/1/links",
    });
    const body = response.json();

    expect(body).toHaveProperty("backLinks");
  });

  it("has forwardLink in response", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/notes/1/links",
    });
    const body = response.json();

    expect(body).toHaveProperty("forwardLinks");
  });

  it("sourceId is id", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/notes/1/links",
    });
    const body = response.json();

    expect(
      body.forwardLinks
        .map(({ sourceId }: { sourceId: number }) => sourceId)
        .filter((item, pos, own) => own.indexOf(item) == pos),
    ).toStrictEqual([1]);
  });
});
