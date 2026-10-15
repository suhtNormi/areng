import { randomUUID } from "node:crypto";
import express from "express";

interface Book {
  id: string;
  title: string;
  author: string;
  read: boolean;
}

export const app = express();
const books: Book[] = [];

app.use(express.json());

// Minimal CORS so the web app can call the API directly in dev.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/api/books", (_req, res) => {
  res.status(200).json(books);
});

app.post("/api/books", (req, res) => {
  const { title, author } = req.body ?? {};
  if (
    typeof title !== "string" || !title.trim() ||
    typeof author !== "string" || !author.trim()
  ) {
    res.status(400).json({ error: "title and author are required" });
    return;
  }
  const book: Book = {
    id: randomUUID(),
    title: title.trim(),
    author: author.trim(),
    read: false,
  };
  books.push(book);
  res.status(201).json(book);
});

app.patch("/api/books/:id", (req, res) => {
  const book = books.find((b) => b.id === req.params.id);
  if (!book) {
    res.status(404).json({ error: "book not found" });
    return;
  }
  const read = req.body?.read;
  if (typeof read !== "boolean") {
    res.status(400).json({ error: "read must be a boolean" });
    return;
  }
  book.read = read;
  res.status(200).json(book);
});

app.delete("/api/books/:id", (req, res) => {
  const index = books.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "book not found" });
    return;
  }
  books.splice(index, 1);
  res.sendStatus(204);
});
