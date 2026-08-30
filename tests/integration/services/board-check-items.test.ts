import { describe, it, expect, beforeEach } from "vitest";
import * as boardCheckItemsService from "@/app/services/board-check-items";
import { createTestUser } from "../fixtures/users";
import { createTestProject } from "../fixtures/projects";
import { createTestBoard } from "../fixtures/boards";
import { createTestBoardSection } from "../fixtures/sections";
import { createTestBoardItem } from "../fixtures/items";
import { createTestBoardCheckItem } from "../fixtures/check-items";

describe("Board Check Items Service Integration Tests", () => {
    let testUserId: string;
    let testProjectId: string;
    let testBoardId: string;
    let testSectionId: string;
    let testItemId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        testUserId = user.id;
        testProjectId = await createTestProject(testUserId, "Test Project");
        testBoardId = await createTestBoard(testUserId, testProjectId);
        testSectionId = await createTestBoardSection(testUserId, testBoardId, 0, "Default Section");
        testItemId = await createTestBoardItem(testUserId, testSectionId, 0, "Base Item");
    });

    describe("createBoardCheckItem", () => {
        it("should create a check item under a board item", async () => {
            const checkItemId = await createTestBoardCheckItem(testUserId, testItemId, 0, "Check 1");

            expect(checkItemId).toBeDefined();

            const items = await boardCheckItemsService.getBoardItemCheckItems(testUserId, testItemId);
            expect(items).toHaveLength(1);
            expect(items[0].id).toBe(checkItemId);
        });
    });

    describe("getBoardItemCheckItems", () => {
        it("should return empty array for no check items", async () => {
            const items = await boardCheckItemsService.getBoardItemCheckItems(testUserId, testItemId);
            expect(items).toHaveLength(0);
        });

        it("should not return other user check items", async () => {
            const checkItemId = await createTestBoardCheckItem(testUserId, testItemId, 0, "Private Check");
            const otherUser = await createTestUser();

            const items = await boardCheckItemsService.getBoardItemCheckItems(otherUser.id, testItemId);
            expect(items).toHaveLength(0);
        });
    });

    describe("updateBoardCheckItem", () => {
        it("should update title and completion", async () => {
            const checkItemId = await createTestBoardCheckItem(testUserId, testItemId, 0, "Old Check");

            const updated = await boardCheckItemsService.updateBoardCheckItem(testUserId, checkItemId, {
                title: "New Check",
                isDone: true,
            });

            expect(updated.title).toBe("New Check");
            expect(updated.isDone).toBe(true);
        });

        it("should reorder check items when position changes", async () => {
            const firstId = await createTestBoardCheckItem(testUserId, testItemId, 0, "First");
            const secondId = await createTestBoardCheckItem(testUserId, testItemId, 1, "Second");
            const thirdId = await createTestBoardCheckItem(testUserId, testItemId, 2, "Third");

            await boardCheckItemsService.updateBoardCheckItem(testUserId, secondId, { position: 0 });

            const items = await boardCheckItemsService.getBoardItemCheckItems(testUserId, testItemId);
            expect(items[0].id).toBe(secondId);
            expect(items[1].id).toBe(firstId);
            expect(items[2].id).toBe(thirdId);
        });

        it("should move the first check item to the end", async () => {
            const firstId = await createTestBoardCheckItem(testUserId, testItemId, 0, "First");
            const secondId = await createTestBoardCheckItem(testUserId, testItemId, 1, "Second");
            const thirdId = await createTestBoardCheckItem(testUserId, testItemId, 2, "Third");

            await boardCheckItemsService.updateBoardCheckItem(testUserId, firstId, { position: 2 });

            const items = await boardCheckItemsService.getBoardItemCheckItems(testUserId, testItemId);
            expect(items[0].id).toBe(secondId);
            expect(items[1].id).toBe(thirdId);
            expect(items[2].id).toBe(firstId);
        });

        it("should throw when updating non-existent check item with position", async () => {
            await expect(
                boardCheckItemsService.updateBoardCheckItem(testUserId, crypto.randomUUID(), { position: 0 })
            ).rejects.toThrow("could not be found");
        });

        it("should throw when deleting non-existent check item", async () => {
            await expect(
                boardCheckItemsService.deleteBoardCheckItem(testUserId, crypto.randomUUID())
            ).rejects.toThrow();
        });
    });

    describe("deleteBoardCheckItem", () => {
        it("should delete a check item and reindex remaining items", async () => {
            const firstId = await createTestBoardCheckItem(testUserId, testItemId, 0, "One");
            const secondId = await createTestBoardCheckItem(testUserId, testItemId, 1, "Two");

            await boardCheckItemsService.deleteBoardCheckItem(testUserId, firstId);

            const items = await boardCheckItemsService.getBoardItemCheckItems(testUserId, testItemId);
            expect(items).toHaveLength(1);
            expect(items[0].id).toBe(secondId);
            expect(items[0].position).toBe(0);
        });
    });

    describe("authorization", () => {
        it("should not allow other users to update check items", async () => {
            const checkItemId = await createTestBoardCheckItem(testUserId, testItemId, 0, "Private");
            const otherUser = await createTestUser();

            await expect(
                boardCheckItemsService.updateBoardCheckItem(otherUser.id, checkItemId, { title: "Hack" })
            ).rejects.toThrow();
        });

        it("should not allow other users to delete check items", async () => {
            const checkItemId = await createTestBoardCheckItem(testUserId, testItemId, 0, "Private");
            const otherUser = await createTestUser();

            await expect(
                boardCheckItemsService.deleteBoardCheckItem(otherUser.id, checkItemId)
            ).rejects.toThrow();
        });
    });
});