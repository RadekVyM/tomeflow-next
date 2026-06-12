import { vi } from "vitest";

vi.mock("next/navigation", () => ({
    redirect: vi.fn((url: string) => {
        const err = new Error("NEXT_REDIRECT");
        (err as any).digest = `NEXT_REDIRECT;307;${url};default;`;
        throw err;
    }),
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    })),
    usePathname: vi.fn(() => ""),
    useSearchParams: vi.fn(() => new URLSearchParams()),
}));