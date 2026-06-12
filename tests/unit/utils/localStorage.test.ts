// @vitest-environment jsdom

import { describe, it, expect, vi } from "vitest";
import { localStorageChanged } from "@/app/utils/localStorage";

describe("localStorageChanged", () => {
    it("dispatches StorageEvent on window", () => {
        const dispatchSpy = vi.spyOn(window, "dispatchEvent");

        localStorageChanged("test-key");

        expect(dispatchSpy).toHaveBeenCalledTimes(1);

        const dispatchedEvent = dispatchSpy.mock.calls[0][0] as StorageEvent;

        expect(dispatchedEvent).toBeInstanceOf(StorageEvent);
        expect(dispatchedEvent.type).toBe("local-storage");
        expect(dispatchedEvent.key).toBe("test-key");

        dispatchSpy.mockRestore();
    });
});