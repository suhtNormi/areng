import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

async function createBook(title = "Dune", author = "Frank Herbert") {
  const res = await request(app).post("/api/books").send({ title, author });
  expect(res.status).toBe(201);
  return res.body as { id: string; title: string; author: string; read: boolean };
}

describe("GET /api/books", () => {
  it("returns 200 with an array", async () => {
    const res = await request(app).get("/api/books");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("includes a newly created book", async () => {
    const book = await createBook("Neuromancer", "William Gibson");
    const res = await request(app).get("/api/books");
    expect(res.status).toBe(200);
    expect(res.body).toContainEqual(book);
  });
});

describe("POST /api/books", () => {
  it("creates a book with read=false and an id", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ title: "Dune", author: "Frank Herbert" });
    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe("string");
    expect(res.body.id.length).toBeGreaterThan(0);
    expect(res.body).toMatchObject({
      title: "Dune",
      author: "Frank Herbert",
      read: false,
    });
  });

  it("assigns unique ids", async () => {
    const a = await createBook();
    const b = await createBook();
    expect(a.id).not.toBe(b.id);
  });

  const invalid: [string, unknown][] = [
    ["missing title", { author: "A" }],
    ["missing author", { title: "T" }],
    ["empty title", { title: "", author: "A" }],
    ["empty author", { title: "T", author: "" }],
    ["empty body", {}],
  ];

  it.each(invalid)("returns 400 for %s", async (_name, body) => {
    const res = await request(app).post("/api/books").send(body as object);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "title and author are required" });
  });

  it("does not store a book on validation failure", async () => {
    const marker = `invalid-${Date.now()}`;
    await request(app).post("/api/books").send({ title: marker });
    const res = await request(app).get("/api/books");
    expect(res.body.some((b: { title: string }) => b.title === marker)).toBe(false);
  });
});

describe("PATCH /api/books/:id", () => {
  it("marks a book read", async () => {
    const book = await createBook();
    const res = await request(app).patch(`/api/books/${book.id}`).send({ read: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...book, read: true });
  });

  it("toggles back to unread", async () => {
    const book = await createBook();
    await request(app).patch(`/api/books/${book.id}`).send({ read: true });
    const res = await request(app).patch(`/api/books/${book.id}`).send({ read: false });
    expect(res.status).toBe(200);
    expect(res.body.read).toBe(false);
  });

  it("persists the change in GET /api/books", async () => {
    const book = await createBook();
    await request(app).patch(`/api/books/${book.id}`).send({ read: true });
    const list = await request(app).get("/api/books");
    const found = list.body.find((b: { id: string }) => b.id === book.id);
    expect(found.read).toBe(true);
  });

  it.each([
    ["string", { read: "true" }],
    ["number", { read: 1 }],
    ["null", { read: null }],
    ["missing", {}],
  ])("returns 400 when read is %s", async (_name, body) => {
    const book = await createBook();
    const res = await request(app).patch(`/api/books/${book.id}`).send(body);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "read must be a boolean" });
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).patch("/api/books/does-not-exist").send({ read: true });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "book not found" });
  });
});

describe("DELETE /api/books/:id", () => {
  it("returns 204 with no body and removes the book", async () => {
    const book = await createBook();
    const res = await request(app).delete(`/api/books/${book.id}`);
    expect(res.status).toBe(204);
    expect(res.text).toBe("");

    const list = await request(app).get("/api/books");
    expect(list.body.some((b: { id: string }) => b.id === book.id)).toBe(false);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).delete("/api/books/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "book not found" });
  });

  it("returns 404 when deleting the same book twice", async () => {
    const book = await createBook();
    await request(app).delete(`/api/books/${book.id}`);
    const res = await request(app).delete(`/api/books/${book.id}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "book not found" });
  });
});
