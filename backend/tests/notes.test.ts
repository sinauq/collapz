import { beforeAll, afterAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/server.js";

async function getNote(app: FastifyInstance, note: { id: number }) {
  const response = await app.inject({
    method: "GET",
    url: `/api/notes/${note.id}`,
  });

  return response.json();
}

async function createTestNote(
  app: FastifyInstance,
  note = {
    title: "Test note",
    content: "This is a test note",
  },
) {
  const response = await app.inject({
    method: "POST",
    url: "/api/notes",
    payload: note,
  });

  expect(response.statusCode).toBe(201);

  return response.json();
}

async function createTestLink(
  app: FastifyInstance,
  source: { id: number },
  target: { id: number },
  relationship: string,
) {
  const response = await app.inject({
    method: "POST",
    url: `/api/notes/${source.id}/links`,
    payload: {
      targetId: target.id,
      relationship,
    },
  });

  expect(response.statusCode).toBe(201);

  return response.json();
}

describe("notes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns existing note", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/notes/1",
    });

    expect(response.statusCode).toBe(200);
  });

  it("returns 404 for a nonexistent note", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/notes/999999",
    });

    expect(response.statusCode).toBe(404);
  });

  it("rejects invalid id", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/notes/abs",
    });

    expect(response.statusCode).toBe(400);
  });

  it("note should have title, content, and links", async () => {
    const note = await createTestNote(app);

    const response = await app.inject({
      method: "GET",
      url: `/api/notes/${note.id}`,
    });

    const body = response.json();

    expect(body).toMatchObject({
      id: note.id,
      content: note.content,
      title: note.title,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      relationships: expect.any(Object),
    });
  });

  it("orphan note should have empty relationship", async () => {
    const note = await createTestNote(app);
    const body = await getNote(app, note);

    expect(body).toHaveProperty("relationships");
    expect(body.relationships).toEqual({ backLinks: [], forwardLinks: [] });
  });

  it("note should have relationship", async () => {
    const source = await createTestNote(app, {
      title: "source",
      content: "source",
    });
    const target = await createTestNote(app, {
      title: "target",
      content: "target",
    });
    // first make link
    const link = await createTestLink(app, source, target, "contradicts");
    // then ask for the bocy
    const sourceBody = await getNote(app, source);
    const targetBody = await getNote(app, target);

    expect(sourceBody.relationships.forwardLinks[0]).toMatchObject({
      id: targetBody.id,
      title: targetBody.title,
      content: targetBody.content,
      relationship: link.relationship,
    });
    expect(targetBody.relationships.backLinks[0]).toMatchObject({
      id: sourceBody.id,
      title: sourceBody.title,
      content: sourceBody.content,
      relationship: link.relationship,
    });
  });
});
