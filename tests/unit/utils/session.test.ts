import { describe, it, expect, vi } from "vitest";
import { getSessionCached } from "@/app/utils/session";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

describe("getSessionCached", () => {
    it("returns session if user is logged in", async () => {
        const mockUserSession = {
            expires: "some-expiry",
            user: {
                id: "user-999",
                name: "Cached User",
                email: "cached@example.com",
                image: "http://img.url",
            },
        };
        vi.mocked(auth as any).mockResolvedValueOnce(mockUserSession);

        const session = await getSessionCached();
        expect(session).toEqual(mockUserSession);
    });

    it("redirects to /auth if user is not logged in", async () => {
        vi.mocked(auth as any).mockResolvedValueOnce(null);

        await expect(getSessionCached()).rejects.toThrow("NEXT_REDIRECT");
        expect(redirect).toHaveBeenCalledWith("/auth");
    });
});
