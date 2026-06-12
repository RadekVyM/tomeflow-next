import { describe, it, expect } from "vitest";
import { isNullOrWhiteSpace, removeAccents } from "@/app/utils/string";

describe("isNullOrWhiteSpace", () => {
    it("returns true for null or undefined", () => {
        expect(isNullOrWhiteSpace(null)).toBe(true);
        expect(isNullOrWhiteSpace(undefined)).toBe(true);
    });

    it("returns true for empty string or whitespace-only string", () => {
        expect(isNullOrWhiteSpace("")).toBe(true);
        expect(isNullOrWhiteSpace("   ")).toBe(true);
    });

    it("returns false for non-empty string", () => {
        expect(isNullOrWhiteSpace("a")).toBe(false);
        expect(isNullOrWhiteSpace(" hello ")).toBe(false);
    });
});

describe("removeAccents", () => {
    it("removes czech accents correctly", () => {
        expect(removeAccents("Příliš žluťoučký kůň úpěl ďábelské ódy.")).toBe(
            "Prilis zlutoucky kun upel dabelske ody."
        );
    });

    it("leaves normal characters unchanged", () => {
        expect(removeAccents("abc 123 !?")).toBe("abc 123 !?");
    });
});