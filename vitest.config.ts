import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [],
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
    },
    resolve: {
        tsconfigPaths: true,
    },
});