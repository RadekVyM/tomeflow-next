import { vi } from "vitest";

export const mockSession = {
    user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
    },
    expires: new Date(Date.now() + 3600 * 1000).toISOString(),
};

export const mockAuthRef = {
    currentSession: mockSession as any | null,
};

vi.mock("@/auth", () => ({
    auth: vi.fn().mockImplementation(() => Promise.resolve(mockAuthRef.currentSession)),
    handlers: { GET: vi.fn(), POST: vi.fn() },
    signIn: vi.fn(),
    signOut: vi.fn(),
}));