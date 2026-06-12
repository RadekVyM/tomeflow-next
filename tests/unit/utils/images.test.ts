// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { imageUrlToDataUrl } from "@/app/utils/images";

describe("imageUrlToDataUrl", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("converts image URL to data URL successfully", async () => {
        const realBlob = new Blob(["mock-image-content"], { type: "image/png" });
        
        const mockResponse = {
            ok: true,
            blob: () => Promise.resolve(realBlob),
        };
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

        const result = await imageUrlToDataUrl("https://example.com/image.png");
        
        expect(result).toBe("data:image/png;base64,bW9jay1pbWFnZS1jb250ZW50");
    });

    it("returns null if the file type is not an image", async () => {
        const textBlob = new Blob(["not an image"], { type: "text/plain" });
        const mockResponse = {
            ok: true,
            blob: () => Promise.resolve(textBlob),
        };
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

        const result = await imageUrlToDataUrl("https://example.com/text.txt");
        expect(result).toBeNull();
    });
});