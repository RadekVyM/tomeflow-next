# Integration Tests - Tomeflow

## Overview

Comprehensive integration tests for the Tomeflow project using Turso database and Drizzle ORM.

## Test Structure

```
tests/integration/
├── fixtures/
│   ├── users.ts       - User factory functions
│   ├── projects.ts    - Project factory functions
│   └── boards.ts      - Board factory functions
└── services/
    ├── projects.test.ts    - Projects service tests
    └── boards.test.ts      - Boards service tests
	└── ...
```

## Setup

The integration tests are configured to:

1. **Run in isolation**: Each test worker gets its own database file (`test-db-{workerId}.db`)
2. **Auto-migrate**: Database schema is applied once before all tests
3. **Clean between tests**: Each test starts with a fresh database state
4. **Mock external dependencies**: Auth, Vercel blob, Next.js APIs are mocked

## Running Tests

### Run all integration tests
```bash
npm test tests/integration
```

### Run specific test file
```bash
npm test tests/integration/services/projects.test.ts
npm test tests/integration/services/boards.test.ts
```

### Run with coverage
```bash
npm test -- --coverage tests/integration
```

## Test Coverage

### ✓ Projects Service
- Create: new projects, set timestamps
- Read: single/multiple projects, fetch recent
- Update: modify title/description, update timestamps
- Delete: remove projects, verify cleanup
- Authorization: enforce user isolation

### ✓ Boards Service
- Create: new boards within projects, timestamps
- Read: single/multiple boards, fetch recent
- Update: modify title, update timestamps
- Delete: remove boards, verify cleanup
- Authorization: enforce user isolation, project isolation

### Planned Services
- [x] Board Sections Service
- [x] Board Items Service
- [x] Check Items Service
- [ ] Documents Service
- [ ] Images Service
- [ ] Search Service

## Key Files

- **vitest.setup.ts**: Configures test database, migrations, and cleanup
- **tests/integration/fixtures/users.ts**: User factory with `createTestUser()`
- **tests/integration/fixtures/projects.ts**: Project factory with `createTestProject(userId, title)`
- **tests/integration/fixtures/boards.ts**: Board factory with `createTestBoard(userId, projectId, title)`

## Database Configuration

The test database:

- Uses local SQLite files in `/data/test/`
- File naming: `test-db-{workerId}.db` to support parallel test execution
- Auto-cleaned after each test via `vitest.setup.ts` afterEach hook
- Foreign key constraints enabled during tests

## Best Practices

1. **Use fixtures**: Always create test data through factory functions in `/fixtures/`
2. **One user per test**: Create a fresh `testUserId` for each test via `beforeEach`
3. **Avoid transactions**: The afterEach cleanup uses transactions; tests with nested transactions can cause locking
4. **Check actual service API**: Read the service file first to match the actual function signatures
5. **Return actual data**: Fixtures should return queried results, not just inserted objects
6. **Test authorization**: Always verify user isolation on CRUD operations
7. **Test timestamps**: Verify createdAt, updatedAt, lastRequestedAt are set correctly

## Common Patterns

### Create test environment
```typescript
let testUserId: string;
let testProjectId: string;

beforeEach(async () => {
	const user = await createTestUser();
	testUserId = user.id;
	testProjectId = await createTestProject(testUserId, "Test Project");
});
```

### Test create operation
```typescript
const boardId = await boardsService.createBoard(
	"My Board",
	testUserId,
	testProjectId
);
expect(boardId).toBeDefined();
```

### Test authorization
```typescript
const otherUser = await createTestUser();
const retrieved = await boardsService.getBoard(otherUser.id, boardId);
expect(retrieved).toBeUndefined();
```

### Test multi-project isolation
```typescript
const project2 = await createTestProject(testUserId, "Project 2");

const board1 = await boardsService.createBoard(
	"Project1 Board",
	testUserId,
	testProjectId
);
const board2 = await boardsService.createBoard(
	"Project2 Board",
	testUserId,
	project2
);

const boards1 = await boardsService.getAllProjectBoards(testUserId, testProjectId);
const boards2 = await boardsService.getAllProjectBoards(testUserId, project2);

expect(boards1).toHaveLength(1);
expect(boards2).toHaveLength(1);
```

## Next Steps

### Phase 2A: Board-Related Services (In Progress)
- [x] Projects service (23 tests, passing)
- [x] Boards service (23 tests, passing)
- [x] Board Sections service
- [x] Board Items service

### Phase 2B: Item Management
- [x] Check Items service
- [x] Position reordering tests (handle transaction locking)

### Phase 3: Document & Image Management
- [ ] Documents service
- [ ] Images service

### Phase 4: Advanced Features
- [ ] Search service
- [ ] Import service
- [ ] Export service

### Phase 5: Integration Tests
- [ ] Cross-service workflows
- [ ] Cascade delete verification
- [ ] Complex transaction scenarios

## Coverage Goals

- **Target**: ≥80% code coverage for service layer
- **Current**: 46 tests passing across 2 services
  - Projects: ~95% coverage (23 tests)
  - Boards: ~95% coverage (23 tests)
- **Path to completion**: ~120 tests for all services (~10 services × 12 tests average)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Turso Documentation](https://docs.turso.tech/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

