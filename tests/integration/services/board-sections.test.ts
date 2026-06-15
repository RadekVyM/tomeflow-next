import { describe, it, expect, beforeEach } from "vitest";
import * as boardSectionsService from "@/app/services/board-sections";
import { createTestUser } from "../fixtures/users";
import { createTestProject } from "../fixtures/projects";
import { createTestBoard } from "../fixtures/boards";
import { createTestBoardSection } from "../fixtures/sections";
import { createTestBoardItem } from "../fixtures/items";
import { createTestBoardCheckItem } from "../fixtures/check-items";

describe("Board Sections Service Integration Tests", () => {
    let testUserId: string;
    let testProjectId: string;
    let testBoardId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        testUserId = user.id;
        testProjectId = await createTestProject(testUserId, "Test Project");
        testBoardId = await createTestBoard(testUserId, testProjectId);
    });

    describe("createBoardSection", () => {
        it("should create a board section in a board", async () => {
            const sectionId = await createTestBoardSection(testUserId, testBoardId, 0, "Section A");

            expect(sectionId).toBeDefined();

            const sections = await boardSectionsService.getBoardSections(testUserId, testBoardId);
            expect(sections).toHaveLength(1);
            expect(sections[0].id).toBe(sectionId);
            expect(sections[0].title).toBe("Section A");
        });
    });

    describe("getBoardSectionTitle", () => {
        it("should return the section title", async () => {
            const sectionId = await createTestBoardSection(testUserId, testBoardId, 0, "Title Test");
            const result = await boardSectionsService.getBoardSectionTitle(testUserId, sectionId);

            expect(result).toBeDefined();
            expect(result?.title).toBe("Title Test");
        });
    });

    describe("getBoardSectionsWithItems", () => {
        it("should include nested items and check items", async () => {
            const sectionId = await createTestBoardSection(testUserId, testBoardId, 0, "Section With Items");
            const itemId = await createTestBoardItem(testUserId, sectionId, 0, "Nested Item");
            await createTestBoardCheckItem(testUserId, itemId, 0, "Subtask 1");
            await createTestBoardCheckItem(testUserId, itemId, 1, "Subtask 2");

            const sections = await boardSectionsService.getBoardSectionsWithItems(testUserId, testBoardId);

            expect(sections).toHaveLength(1);
            expect(sections[0].items).toHaveLength(1);
            expect(sections[0].items[0].checkItems).toHaveLength(2);
            expect(sections[0].items[0].checkItems[0].isDone).toBe(false);
        });
    });

    describe("updateBoardSection", () => {
        it("should update the section title", async () => {
            const sectionId = await createTestBoardSection(testUserId, testBoardId, 0, "Old Title");
            const updated = await boardSectionsService.updateBoardSection(testUserId, sectionId, { title: "New Title" });

            expect(updated).toBeDefined();
            expect(updated.title).toBe("New Title");
        });

        it("should reorder sections when position changes", async () => {
            const firstSectionId = await createTestBoardSection(testUserId, testBoardId, 0, "First");
            const secondSectionId = await createTestBoardSection(testUserId, testBoardId, 1, "Second");
            const thirdSectionId = await createTestBoardSection(testUserId, testBoardId, 2, "Third");

            await boardSectionsService.updateBoardSection(testUserId, secondSectionId, { position: 0 });

            const sections = await boardSectionsService.getBoardSections(testUserId, testBoardId);
            expect(sections[0].id).toBe(secondSectionId);
            expect(sections[1].id).toBe(firstSectionId);
            expect(sections[2].id).toBe(thirdSectionId);
        });

        it("should reorder sections when the first section is moved to the end", async () => {
            const firstSectionId = await createTestBoardSection(testUserId, testBoardId, 0, "First");
            const secondSectionId = await createTestBoardSection(testUserId, testBoardId, 1, "Second");
            const thirdSectionId = await createTestBoardSection(testUserId, testBoardId, 2, "Third");

            await boardSectionsService.updateBoardSection(testUserId, firstSectionId, { position: 2 });

            const sections = await boardSectionsService.getBoardSections(testUserId, testBoardId);
            expect(sections[0].id).toBe(secondSectionId);
            expect(sections[1].id).toBe(thirdSectionId);
            expect(sections[2].id).toBe(firstSectionId);
        });
    });

    describe("deleteBoardSection", () => {
        it("should delete a section and keep remaining order", async () => {
            const firstSectionId = await createTestBoardSection(testUserId, testBoardId, 0, "First");
            const secondSectionId = await createTestBoardSection(testUserId, testBoardId, 1, "Second");

            await boardSectionsService.deleteBoardSection(testUserId, firstSectionId);

            const sections = await boardSectionsService.getBoardSections(testUserId, testBoardId);
            expect(sections).toHaveLength(1);
            expect(sections[0].id).toBe(secondSectionId);
            expect(sections[0].position).toBe(0);
        });
    });

    describe("authorization", () => {
        it("should not allow other users to access sections", async () => {
            const sectionId = await createTestBoardSection(testUserId, testBoardId, 0, "Private");
            const otherUser = await createTestUser();

            const sections = await boardSectionsService.getBoardSections(otherUser.id, testBoardId);
            expect(sections).toHaveLength(0);

            await expect(boardSectionsService.getBoardSectionTitle(otherUser.id, sectionId)).resolves.toBeUndefined();
        });
    });
});