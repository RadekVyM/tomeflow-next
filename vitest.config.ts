import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [],
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
        testTimeout: 30000,
    },
    resolve: {
        tsconfigPaths: true,
    },
});