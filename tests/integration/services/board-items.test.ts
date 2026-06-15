import { describe, it, expect, beforeEach } from "vitest";
import * as boardItemsService from "@/app/services/board-items";
import { createTestUser } from "../fixtures/users";
import { createTestProject } from "../fixtures/projects";
import { createTestBoard } from "../fixtures/boards";
import { createTestBoardSection } from "../fixtures/sections";
import { createTestBoardItem } from "../fixtures/items";

describe("Board Items Service Integration Tests", () => {
    let testUserId: string;
    let testProjectId: string;
    let testBoardId: string;
    let testSectionId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        testUserId = user.id;
        testProjectId = await createTestProject(testUserId, "Test Project");
        testBoardId = await createTestBoard(testUserId, testProjectId);
        testSectionId = await createTestBoardSection(testUserId, testBoardId, 0, "Default Section");
    });

    describe("createBoardItem", () => {
        it("should create an item in a section", async () => {
            const itemId = await createTestBoardItem(testUserId, testSectionId, 0, "Item A");

            expect(itemId).toBeDefined();

            const item = await boardItemsService.getBoardItem(testUserId, itemId);
            expect(item).toBeDefined();
            expect(item?.title).toBe("Item A");
            expect(item?.section?.title).toBe("Default Section");
        });
    });

    describe("getBoardItem", () => {
        it("should return undefined for missing item", async () => {
            const item = await boardItemsService.getBoardItem(testUserId, crypto.randomUUID());
            expect(item).toBeUndefined();
        });

        it("should not expose other user items", async () => {
            const itemId = await createTestBoardItem(testUserId, testSectionId, 0, "Hidden Item");
            const otherUser = await createTestUser();

            const item = await boardItemsService.getBoardItem(otherUser.id, itemId);
            expect(item).toBeUndefined();
        });
    });

    describe("updateBoardItem", () => {
        it("should update title and description", async () => {
            const itemId = await createTestBoardItem(testUserId, testSectionId, 0, "Original");
            const updated = await boardItemsService.updateBoardItem(testUserId, itemId, {
                title: "Updated",
                description: "Details",
            });

            expect(updated.title).toBe("Updated");
            expect(updated.description).toBe("Details");
        });

        it("should update position within same section", async () => {
            const firstId = await createTestBoardItem(testUserId, testSectionId, 0, "First");
            const secondId = await createTestBoardItem(testUserId, testSectionId, 1, "Second");
            const thirdId = await createTestBoardItem(testUserId, testSectionId, 2, "Third");

            await boardItemsService.updateBoardItem(testUserId, secondId, { position: 0 });

            const first = await boardItemsService.getBoardItem(testUserId, firstId);
            const second = await boardItemsService.getBoardItem(testUserId, secondId);
            const third = await boardItemsService.getBoardItem(testUserId, thirdId);

            expect(first?.position).toBe(1);
            expect(second?.position).toBe(0);
            expect(third?.position).toBe(2);
        });

        it("should move the first item to the end within same section", async () => {
            const firstId = await createTestBoardItem(testUserId, testSectionId, 0, "First");
            const secondId = await createTestBoardItem(testUserId, testSectionId, 1, "Second");
            const thirdId = await createTestBoardItem(testUserId, testSectionId, 2, "Third");

            await boardItemsService.updateBoardItem(testUserId, firstId, { position: 2 });

            const first = await boardItemsService.getBoardItem(testUserId, firstId);
            const second = await boardItemsService.getBoardItem(testUserId, secondId);
            const third = await boardItemsService.getBoardItem(testUserId, thirdId);

            expect(first?.position).toBe(2);
            expect(second?.position).toBe(0);
            expect(third?.position).toBe(1);
        });

        it("should move item to another section with position", async () => {
            const sourceItemId = await createTestBoardItem(testUserId, testSectionId, 0, "Move Me");
            const targetSectionId = await createTestBoardSection(testUserId, testBoardId, 1, "Target Section");

            await boardItemsService.updateBoardItem(testUserId, sourceItemId, {
                sectionId: targetSectionId,
                position: 0,
            });

            const movedItem = await boardItemsService.getBoardItem(testUserId, sourceItemId);
            expect(movedItem?.parentId).toBe(targetSectionId);
            expect(movedItem?.position).toBe(0);
        });
    });

    describe("deleteBoardItem", () => {
        it("should delete an item and reindex remaining items", async () => {
            const firstId = await createTestBoardItem(testUserId, testSectionId, 0, "One");
            const secondId = await createTestBoardItem(testUserId, testSectionId, 1, "Two");

            await boardItemsService.deleteBoardItem(testUserId, firstId);

            const remaining = await boardItemsService.getBoardItem(testUserId, secondId);
            expect(remaining).toBeDefined();
            expect(remaining?.position).toBe(0);
        });
    });

    describe("authorization", () => {
        it("should prevent other users from updating items", async () => {
            const itemId = await createTestBoardItem(testUserId, testSectionId, 0, "Private Item");
            const otherUser = await createTestUser();

            await expect(
                boardItemsService.updateBoardItem(otherUser.id, itemId, { title: "Hack" })
            ).rejects.toThrow();
        });
    });
});