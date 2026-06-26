# E2E Tests — Tomeflow

## Overview

End-to-end tests for the Tomeflow project using Playwright. These tests cover user-facing flows, client-side interactions, navigation, and cross-page data integrity. The service layer is already covered by integration tests (179 tests across 13 files).

## Approach

- **Auth**: Inject NextAuth.js session cookie via Playwright `page.context().addCookies()`. A `helpers/login.ts` helper handles session creation.
- **Data**: Each spec file seeds its own `data/test/test-e2e.db` in a `beforeAll` hook (insert user + fixtures). A `helpers/seed.ts` helper provides factory functions matching integration test patterns.
- **Drag & drop**: Use Playwright's `page.mouse.move` / `page.mouse.down` / `page.mouse.up` to simulate dnd-kit drag operations (dnd-kit uses pointer events, not native HTML5 drag).
- **Concurrency**: `workers: 1`, `fullyParallel: false` (already configured) to avoid SQLite lock conflicts.

## Test Structure

```
tests/e2e/
├── helpers/
│   ├── login.ts           # Injects NextAuth.js session cookie
│   ├── seed.ts            # Seeds DB with user + test data factories
│   └── navigate.ts        # Navigation helpers (sidebar clicks, breadcrumbs)
│
├── auth.spec.ts           # Auth + access control
├── home.spec.ts           # Home page
├── projects.spec.ts       # Project CRUD
├── documents.spec.ts      # Document CRUD + editing
├── boards.spec.ts         # Board CRUD, sections, items, drag-and-drop
├── search.spec.ts         # Search flow
├── export-import.spec.ts  # Export / import
├── theme.spec.ts          # Theme toggle
└── error.spec.ts          # 404s, error boundaries, protected routes
```

## Setup

The E2E tests use:

1. **Shared test database**: `data/test/test-e2e.db` (set via `TURSO_DATABASE_URL` in `playwright.config.ts`)
2. **Per-file seeding**: Each spec file seeds its own required data in `beforeAll`, using the `@libsql/client` driver directly
3. **Session injection**: No real Google OAuth — a session cookie is injected before each test file via `helpers/login.ts`
4. **No cleanup between tests within a file**: Tests within a file are ordered and rely on data created by previous tests (e.g., create project → rename it → delete it)

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run specific test file
```bash
npx playwright test tests/e2e/projects.spec.ts
```

### Run with UI mode
```bash
npx playwright test --ui
```

### Debug a specific test
```bash
npx playwright test tests/e2e/boards.spec.ts --debug
```

## Test Details

### auth.spec.ts (3 tests)

| # | Test | Description |
|---|---|---|
| 1 | Redirect unauthenticated user | Visiting `/projects` without session → redirected to `/auth` |
| 2 | Sign-in page renders | `/auth` page shows Google sign-in button |
| 3 | API protection | `GET /api/projects` without session → 401 |

### home.spec.ts (4 tests)

| # | Test | Description |
|---|---|---|
| 1 | Empty state | No projects → empty state with "Create your first project" prompt visible |
| 2 | Recent projects list | Seed 3 projects → home page shows all 3 in "Recent projects" with correct titles |
| 3 | Recent content | Seed projects with 2 boards + 2 documents → "Recent content" shows boards + documents sorted by recency |
| 4 | Sidebar navigation | Click sidebar Home / Projects links → correct pages render |

### projects.spec.ts (6 tests)

| # | Test | Description |
|---|---|---|
| 1 | Create a project | Click "New project" → dialog → enter title → submit → redirected to `/projects/{id}` with title visible |
| 2 | Projects list | Navigate to `/projects` → all seeded projects listed |
| 3 | Rename a project | On project page → more menu → "Rename" → new title → persists on refresh |
| 4 | Update description | Click description → edit → save → new description visible on reload |
| 5 | Delete a project | More menu → "Delete" → confirm dialog → redirected to `/projects` → project removed |
| 6 | Empty project page | New project without boards/docs → sees "Create your first board or document" prompt with action buttons |

### documents.spec.ts (6 tests)

| # | Test | Description |
|---|---|---|
| 1 | Create a document | On project page → click "New document" → enter title → redirected to document page with title |
| 2 | View markdown content | Document with seeded markdown → headings, lists, bold render correctly |
| 3 | Edit document content | Click "Edit document" → markdown editor dialog → type content → save → content rendered in preview |
| 4 | Rename a document | More menu → "Rename" → new title → persists on reload |
| 5 | Delete a document | More menu → "Delete" → confirm → back to project page, document removed from list |
| 6 | Empty document state | New empty document → "Empty document" prompt with edit button shown |

### boards.spec.ts (12 tests)

| # | Test | Description |
|---|---|---|
| 1 | Create a board | Click "New board" → enter title → redirected to board fullscreen page |
| 2 | Add a section | Click "+ Section" → enter title → section column appears |
| 3 | Rename a section | Section more menu (⋮) → "Rename section" → new title → persists on reload |
| 4 | Delete a section | Section more menu → "Remove section" → confirm → section removed |
| 5 | Add an item | Type in "New item" field → click "Add item" → item card appears in section |
| 6 | Mark item done/undone | Click item checkbox → toggles → persists on reload |
| 7 | Edit item title in dialog | Click item → dialog opens → click title → edit → save → title updated |
| 8 | Edit description (markdown) | In item dialog → "Add description" → markdown editor → save → preview rendered |
| 9 | Add and toggle check items | In item dialog → add check items → toggle checkboxes → progress indicator updates |
| 10 | Move item via dialog | Item dialog → "Move to section" button → select target section → item moves to target |
| 11 | Delete an item | Item dialog → trash icon → confirm → item removed from board |
| 12 | Drag and drop | — Reorder sections horizontally: drag section left → order persists on reload |
|   |   | — Reorder items vertically within section: drag item up → order persists |
|   |   | — Move item between sections: drag to different column → item appears in target, persists |

### search.spec.ts (4 tests)

| # | Test | Description |
|---|---|---|
| 1 | Search dialog opens | Click search button in sidebar (or press "F" key) → dialog appears with search input |
| 2 | Search by project title | Type a project title → matching project shown in results with correct icon |
| 3 | Partial match search | Type partial board/item/document title → correct entity type found |
| 4 | Navigate to search result | Click a result → navigated to correct page (board page with `?itemId=` param for items) |

### export-import.spec.ts (3 tests)

| # | Test | Description |
|---|---|---|
| 1 | Export all projects | `/projects` → more menu → "Export all" → JSON file downloaded with all projects |
| 2 | Export single project | Project page → more menu → "Export" → JSON downloaded with full board/document hierarchy |
| 3 | Import projects | `/projects` → more menu → "Import" → upload a valid export JSON → projects appear in list |

### theme.spec.ts (1 test)

| # | Test | Description |
|---|---|---|
| 1 | Toggle theme | Click settings gear → theme switcher → select dark theme → cookie `theme=dark` set → visual class applied |

### error.spec.ts (4 tests)

| # | Test | Description |
|---|---|---|
| 1 | 404 on non-existent project | Visit `/projects/non-existent-id` → 404 page shown |
| 2 | 404 on non-existent document | Visit valid project with invalid document ID → 404 |
| 3 | 404 on non-existent board | Visit valid project with invalid board ID → 404 |
| 4 | Protected route redirect | Without session, direct URL to `/projects/xxx` → redirects to `/auth` |

## Helper Modules

### `helpers/login.ts`
- Calls `auth()` to create a session for the test user
- Injects the `next-auth.session-token` cookie into the Playwright browser context

```typescript
import { auth } from "@/auth";
import type { Page } from "@playwright/test";

export async function loginAsUser(page: Page, userId: string): Promise<void> {
    // Create session in DB + inject cookie
}
```

### `helpers/seed.ts`
- Uses `@libsql/client` to directly insert into the test DB
- Creates test user, projects, boards with sections/items/checkItems, documents
- Each spec file calls the appropriate seed function in `beforeAll`

```typescript
import { createClient } from "@libsql/client";

export async function seedTestUser(dbUrl: string): Promise<{ id: string, email: string }>;
export async function seedTestProjects(dbUrl: string, userId: string, count: number): Promise<Array<string>>;
export async function seedTestBoards(dbUrl: string, userId: string, projectId: string, count: number): Promise<Array<string>>;
export async function seedTestDocuments(dbUrl: string, userId: string, projectId: string, count: number): Promise<Array<string>>;
export async function seedFullBoard(dbUrl: string, userId: string, projectId: string, boardId: string): Promise<void>;
```

## Implementation Order

1. `helpers/login.ts` + `helpers/seed.ts` — foundation layer
2. `auth.spec.ts` — simplest tests, validates setup works
3. `projects.spec.ts` — core CRUD, exercises login + seed
4. `home.spec.ts` — relies on seeded data
5. `documents.spec.ts` — extends project flow
6. `boards.spec.ts` — most complex, save for after CRUD basics are solid
7. `search.spec.ts` — depends on seeded data from multiple entity types
8. `error.spec.ts`, `theme.spec.ts`, `export-import.spec.ts` — independent standalone specs

## Key Considerations

- **Session format**: NextAuth.js v5 session cookies need to match the exact name and encoding used by the framework. The session must exist in the `session` table in the test DB.
- **DB file path**: Must match the path set in `playwright.config.ts` (`data/test/test-e2e.db`). The dev server and Playwright share this file.
- **Migration strategy**: The dev server auto-applies migrations on startup. The seed helpers can insert data directly without migrations as long as the schema is already applied.
- **Drag and drop limitations**: dnd-kit uses synthetic pointer events. Playwright's native `dragTo()` may not work — use low-level mouse events (mousedown, mousemove, mouseup) with intentional delays.
- **Test isolation within a file**: Tests within a spec file are sequential and build on each other. This matches the `workers: 1` config and avoids re-seeding between every test.

## Related

- [Integration Tests](./INTEGRATION_TESTS.md) — service-layer test details
- [Playwright Configuration](../playwright.config.ts) — test runner settings
- [Vitest Setup](../vitest.setup.ts) — integration test DB configuration
