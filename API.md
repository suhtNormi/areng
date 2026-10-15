# API

Base path: `/api`. All bodies are JSON. Storage is in-memory (resets on restart).

## Book

```json
{ "id": "string", "title": "string", "author": "string", "read": false }
```

## Endpoints

### GET /api/books
- 200: `Book[]`

### POST /api/books
Request: `{ "title": "string", "author": "string" }` (both required, non-empty)
- 201: `Book` (`read` starts `false`)
- 400: `{ "error": "title and author are required" }`

### PATCH /api/books/:id
Mark read/unread. Request: `{ "read": true }`
- 200: `Book`
- 400: `{ "error": "read must be a boolean" }`
- 404: `{ "error": "book not found" }`

### DELETE /api/books/:id
- 204: no body
- 404: `{ "error": "book not found" }`
