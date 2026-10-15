# Reading List
Tiny full-stack TypeScript app: list, add, mark read, delete books.

## Stack
- server/: Node + Express + TypeScript, in-memory storage (no database)
- web/: Vite + vanilla TypeScript, calls the API with fetch
- server/tests/: Vitest + supertest

## Rules
- API.md is the contract. Don't change it without messaging the other teammates.
- Only edit files in the folder you own.
- Don't commit. The human reviews and commits.
- Run `npm test` in server/ before marking a task done.