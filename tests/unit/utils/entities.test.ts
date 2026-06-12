import { describe, it, expect } from "vitest";
import { lastSeenAt, mergeDocumentsAndBoards } from "@/app/utils/entities";
import { ProjectBoardSchema, ProjectDocumentSchema } from "@/db/schema";

describe("lastSeenAt", () => {
    it("returns the maximum timestamp of createdAt, updatedAt, and lastRequestedAt", () => {
        const entity = {
            createdAt: 100,
            updatedAt: 200,
            lastRequestedAt: 150,
        };
        expect(lastSeenAt(entity)).toBe(200);

        const entity2 = {
            createdAt: 300,
            updatedAt: 100,
            lastRequestedAt: 500,
        };
        expect(lastSeenAt(entity2)).toBe(500);
    });
});

describe("mergeDocumentsAndBoards", () => {
    const mockBoard = (id: string, projectId: string, time: number): ProjectBoardSchema => ({
        id,
        projectId,
        userId: "user-1",
        title: `Board ${id}`,
        createdAt: time,
        updatedAt: time,
        lastRequestedAt: time,
    });

    const mockDocument = (id: string, projectId: string, time: number): ProjectDocumentSchema => ({
        id,
        projectId,
        userId: "user-1",
        title: `Doc ${id}`,
        content: "some content",
        createdAt: time,
        updatedAt: time,
        lastRequestedAt: time,
    });

    it("merges boards and documents, adding url and icon, and sorts them by lastSeenAt desc", () => {
        const board = mockBoard("board-1", "project-x", 100);
        const doc = mockDocument("doc-1", "project-x", 200);

        const merged = mergeDocumentsAndBoards([board], [doc]);

        expect(merged).toHaveLength(2);
        // Doc should be first since time is 200 > 100
        expect(merged[0].id).toBe("doc-1");
        expect(merged[0].url).toBe("/projects/project-x/documents/doc-1");
        expect(merged[0].icon).toBeDefined();

        expect(merged[1].id).toBe("board-1");
        expect(merged[1].url).toBe("/projects/project-x/boards/board-1");
        expect(merged[1].icon).toBeDefined();
    });

    it("respects the limit argument", () => {
        const board1 = mockBoard("board-1", "project-x", 100);
        const board2 = mockBoard("board-2", "project-x", 150);
        const doc = mockDocument("doc-1", "project-x", 200);

        const merged = mergeDocumentsAndBoards([board1, board2], [doc], 2);

        // Unsorted items: [board1, board2, doc]
        // Sliced to 2: [doc, board2]
        // Sorted: [doc (200), board2 (150)]
        expect(merged).toHaveLength(2);
        expect(merged[0].id).toBe("doc-1");
        expect(merged[1].id).toBe("board-2");
    });
});