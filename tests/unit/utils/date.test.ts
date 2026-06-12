import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatRelativeTime } from "@/app/utils/date";

describe("formatRelativeTime", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Set the system time to a fixed date: Friday, June 12, 2026
        vi.setSystemTime(new Date("2026-06-12T12:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("formats seconds ago correctly", () => {
        const past = new Date("2026-06-12T11:59:30.000Z"); // 30 seconds ago
        const formatted = formatRelativeTime(past, "en");
        expect(formatted).toContain("30");
    });

    it("formats minutes ago correctly", () => {
        const past = new Date("2026-06-12T11:55:00.000Z"); // 5 minutes ago
        const formatted = formatRelativeTime(past, "en");
        expect(formatted).toContain("5");
    });

    it("formats hours ago correctly", () => {
        const past = new Date("2026-06-12T10:00:00.000Z"); // 2 hours ago
        const formatted = formatRelativeTime(past, "en");
        expect(formatted).toContain("2");
    });

    it("formats days ago correctly", () => {
        const past = new Date("2026-06-10T12:00:00.000Z"); // 2 days ago
        const formatted = formatRelativeTime(past, "en");
        expect(formatted).toContain("2");
    });
});