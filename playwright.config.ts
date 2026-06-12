import { defineConfig, devices } from "@playwright/test";

// Force E2E test database for both Playwright test scripts and the Next.js server
const dbUrl = "file:data/test/test-e2e.db";
process.env.TURSO_DATABASE_URL = dbUrl;
process.env.TURSO_AUTH_TOKEN = "";

export default defineConfig({
    testDir: "./tests/e2e",
    // Run E2E tests sequentially to avoid database lock conflicts on the shared test-e2e.db file
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: "html",
    use: {
        baseURL: "http://127.0.0.1:3000",
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: `TURSO_DATABASE_URL=${dbUrl} TURSO_AUTH_TOKEN= npm run dev`,
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
    },
});