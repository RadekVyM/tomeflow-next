import "./envConfig";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./migrations",
    schema: "./db/schema.ts",
    dialect: "turso",
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: !process.env.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN.length === 0 ?
            undefined :
            process.env.TURSO_AUTH_TOKEN!,
    },
});
