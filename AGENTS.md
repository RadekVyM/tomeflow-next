# Tomeflow — Agent Instructions

## Commands

| Command | What |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm run lint` | ESLint (next lint) |
| `npm test` | Vitest (unit + integration) |
| `npm run test:watch` | Vitest watch |
| `npm run test:e2e` | Playwright (sequential, single-worker) |
| `npm run db:generate` | Drizzle → migration SQL |
| `npm run db:push` | Push schema (uses `.env`) |
| `npm run db:migrate` | Run migrations (uses `.env`) |
| `npm run turso:dev` | Local Turso at `./data/local.db` |

Run `lint && build` before committing.

## Architecture

- **Pages**: Next.js App Router — route groups `(with-sidebar)` (main app) and `(without-sidebar)` (auth). Project detail has `(scrollable)`/`(fullscreen)` sub-layouts.
- **Services → Actions → UI**: `app/services/` (server-only business logic) → `app/actions/` (next-safe-action wrappers) → React components. Actions call services, services call `db` directly.
- **DB**: Turso (libSQL, SQLite-compatible) via Drizzle ORM. Schema in `db/schema.ts`, client in `db/index.ts` (reads `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`).
- **Auth**: NextAuth.js v5 with Google OAuth, Drizzle adapter. Access gated by `ALLOWED_GOOGLE_IDS` env var. Protected paths: `/api/projects`, `/api/search`, `/projects`.
- **Search**: Local `search_index` table populated via raw SQL (`scripts/search_index_data_sync.sql`).
- **React Compiler** is enabled (`next.config.ts`). Tailwind CSS v4 with PostCSS (`@tailwindcss/postcss`).
- **CSS** split across: `globals.css`, `colors.css`, `button.css`, `markdown.css`, `animations.css`.

## Testing

- **Integration tests** (`tests/integration/services/`): each worker gets `data/test/test-db-{workerId}.db`, auto-migrated (`vitest.setup.ts`), tables wiped after each test. Run with `npm test tests/integration/services/foo.test.ts`.
- **Unit tests** under `tests/unit/utils/`. Run with `npm test tests/unit/utils/`.
- **All tests**: `npm test` runs Vitest.
- **E2E tests**: Playwright, single worker (`workers: 1`, `fullyParallel: false`), uses `data/test/test-e2e.db`. Start via `npm run test:e2e`.
- **Mocks** in `tests/mocks/`: `auth`, `next/cache`, `next/navigation`, `@vercel/blob` — auto-loaded via `vitest.setup.ts`.
- **Fixtures** in `tests/integration/fixtures/`: factory functions for users, projects, boards, sections, items, check-items, documents, images. Always create fresh `testUserId` per `beforeEach`.

## Key Conventions

- ESLint has many rules disabled (`exhaustive-deps`, `no-explicit-any`, `no-unused-vars`, etc.) — don't fight them.
- `@/*` path alias maps to project root.
- Theme stored in cookie named `"theme"`.
- DB migrations: `drizzle.config.ts` imports `envConfig.ts` to load env vars for CLI. Use `dotenv -e .env -- drizzle-kit ...` for manual migration commands.
- CI (push to `main`): runs `drizzle-kit migrate` against remote Turso.
- `data/` is gitignored (local DBs, test DBs). `data/local.db` is the local Turso dev DB.

## Code Formatting

- **Closing paren on same line**: When a function call spans multiple lines, put `)` on the same line as the last argument, never on its own line.
  ```typescript
  // ✓ correct
  const boardId = await boardsService.createBoard(
      "My Board",
      testUserId,
      testProjectId);

  // ✗ wrong
  const boardId = await boardsService.createBoard(
      "My Board",
      testUserId,
      testProjectId
  );
  ```
- **Object literals**: `});` closing an object literal passed as a function argument may be on its own line (e.g. `result.push({ ... });`).
- **Chained calls**: Each `.method()` goes on its own line, indented; closing `)` at end of the line.
- **Catch/finally**: `catch` and `finally` go on their own line (not `} catch`).
  ```typescript
  try { ... }
  catch (error) { ... }
  finally { ... }
  ```
- **Semicolons**: Always present.
- **Quotes**: Double quotes for strings.
- **Arrow functions**: Parentheses around parameters even without types: `(r) => r.type`.
- **Trailing commas**: On multi-line parameter lists and object literals.
- **Type annotations**: Space after colon (`userId: string`).
- **Arrays**: `Array<T>` instead of `T[]`. `new Array<T>()` instead of `[]` when the type cannot be inferred from the left side.
