import { describe, it, expect, vi, afterEach } from "vitest";
import { isMobileUserAgent } from "@/app/utils/userAgent";

describe("isMobileUserAgent", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns true for mobile user agents", () => {
        const mobileUA = [
            "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
            "Mozilla/5.0 (Linux; Android 11; Pixel 5)",
            "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)",
        ];

        for (const ua of mobileUA) {
            vi.stubGlobal("navigator", { userAgent: ua });
            expect(isMobileUserAgent()).toBe(true);
        }
    });

    it("returns false for desktop user agents", () => {
        const desktopUA = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        ];

        for (const ua of desktopUA) {
            vi.stubGlobal("navigator", { userAgent: ua });
            expect(isMobileUserAgent()).toBe(false);
        }
    });
});