import { vi } from "vitest";

vi.mock("@vercel/blob", () => ({
    put: vi.fn().mockResolvedValue({ url: "https://example.com/mock-image.png" }),
    del: vi.fn().mockResolvedValue(undefined),
}));