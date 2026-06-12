import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { beforeAll, afterEach, vi } from "vitest";
import "./tests/mocks/next-cache";
import "./tests/mocks/next-navigation";
import "./tests/mocks/auth";
import "./tests/mocks/vercel-blob";
import { mockAuthRef, mockSession } from "./tests/mocks/auth";

// Determine worker-specific database path to prevent SQLite locking in parallel tests
const workerId = process.env.VITEST_WORKER_ID || "1";
const dbPath = join(process.cwd(), "data", "test", `test-db-${workerId}.db`);
const testDir = join(process.cwd(), "data", "test");

if (!existsSync(testDir)) {
    mkdirSync(testDir, { recursive: true });
}

// Set environment variables synchronously before anything else loads
process.env.TURSO_DATABASE_URL = `file:${dbPath}`;
process.env.TURSO_AUTH_TOKEN = "";

// Declare variable to hold db dynamically to avoid static ESM hoisting issues
let dbInstance: any;

// Run migrations once before all tests
beforeAll(async () => {
    const { db } = await import("./db");
    dbInstance = db;
    const { migrate } = await import("drizzle-orm/libsql/migrator");
    await migrate(dbInstance, { migrationsFolder: "./migrations" });
});

// Reset database tables after each test to ensure isolation
afterEach(async () => {
    if (!dbInstance) {
        return;
    }
    const { sql } = await import("drizzle-orm");

    const tables = [
        "user",
        "account",
        "session",
        "verificationToken",
        "authenticator",
        "projects",
        "project_documents",
        "project_boards",
        "project_board_sections",
        "project_board_items",
        "project_board_check_items",
        "vercel_images",
        "search_index",
    ];

    await dbInstance.run(sql`PRAGMA foreign_keys = OFF`);
    for (const table of tables) {
        try {
            await dbInstance.run(sql`DELETE FROM ${sql.raw(`\`${table}\``)}`);
        }
        catch (e) {
            // Ignore tables that might not exist yet in schema migrations
        }
    }
    await dbInstance.run(sql`PRAGMA foreign_keys = ON`);

    // Reset all mock call histories between tests
    vi.clearAllMocks();

    // Reset mock auth back to default
    mockAuthRef.currentSession = mockSession;
});