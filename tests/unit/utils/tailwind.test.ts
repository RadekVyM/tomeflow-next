import { describe, it, expect } from "vitest";
import { cn } from "@/app/utils/tailwind";

describe("cn", () => {
    it("merges tailwind classes and resolves conflicts correctly", () => {
        expect(cn("px-2 py-2", "p-4")).toBe("p-4");
        expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("handles conditional classes", () => {
        expect(cn("class-a", true && "class-b", false && "class-c")).toBe("class-a class-b");
    });

    it("handles nested class values and arrays", () => {
        expect(cn(["class-a", "class-b"], { "class-c": true, "class-d": false })).toBe("class-a class-b class-c");
    });
});