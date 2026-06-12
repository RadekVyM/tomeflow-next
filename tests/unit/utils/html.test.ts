// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("html utils", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("detects when not on Mac", async () => {
        vi.stubGlobal("navigator", { userAgent: "Windows NT 10.0" });
        const { isMac } = await import("@/app/utils/html");
        expect(isMac).toBe(false);
    });

    it("detects when on Mac", async () => {
        vi.stubGlobal("navigator", { userAgent: "Macintosh; Intel Mac OS X" });
        const { isMac } = await import("@/app/utils/html");
        expect(isMac).toBe(true);
    });

    it("identifies editable elements", async () => {
        const { isEditableElement } = await import("@/app/utils/html");

        const input = document.createElement("input");
        const textarea = document.createElement("textarea");
        const select = document.createElement("select");
        const div = document.createElement("div");

        expect(isEditableElement(input)).toBe(true);
        expect(isEditableElement(textarea)).toBe(true);
        expect(isEditableElement(select)).toBe(true);
        expect(isEditableElement(div)).toBe(false);
    });

    it("verifies isCtrl behaves differently based on OS platform", async () => {
        // Test on Windows
        vi.stubGlobal("navigator", { userAgent: "Windows NT" });
        const winUtils = await import("@/app/utils/html");

        expect(winUtils.isCtrl({ ctrlKey: true, metaKey: false } as KeyboardEvent)).toBe(true);
        expect(winUtils.isCtrl({ ctrlKey: false, metaKey: true } as KeyboardEvent)).toBe(false);

        // Reset modules cache to re-import with different environment
        vi.resetModules();

        // Test on Mac
        vi.stubGlobal("navigator", { userAgent: "Macintosh" });
        const macUtils = await import("@/app/utils/html");

        expect(macUtils.isCtrl({ ctrlKey: false, metaKey: true } as KeyboardEvent)).toBe(true);
        expect(macUtils.isCtrl({ ctrlKey: true, metaKey: false } as KeyboardEvent)).toBe(false);
    });
});