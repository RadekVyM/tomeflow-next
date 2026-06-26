import { describe, it, expect, beforeEach } from "vitest";
import * as boardItemsService from "@/app/services/board-items";
import * as boardSectionsService from "@/app/services/board-sections";
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

        it("should clear description when updating with null", async () => {
            const itemId = await createTestBoardItem(testUserId, testSectionId, 0, "Original");
            await boardItemsService.updateBoardItem(testUserId, itemId, { description: "Temp" });

            const updated = await boardItemsService.updateBoardItem(testUserId, itemId, { description: null });

            expect(updated.description).toBeNull();
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

        it("should handle moving item to its own section as a no-op reorder", async () => {
            const firstId = await createTestBoardItem(testUserId, testSectionId, 0, "First");
            const secondId = await createTestBoardItem(testUserId, testSectionId, 1, "Second");

            await boardItemsService.updateBoardItem(testUserId, firstId, {
                sectionId: testSectionId,
                position: 1,
            });

            expect((await boardItemsService.getBoardItem(testUserId, firstId))!.parentId).toBe(testSectionId);
            expect((await boardItemsService.getBoardItem(testUserId, firstId))!.position).toBe(1);
            expect((await boardItemsService.getBoardItem(testUserId, secondId))!.position).toBe(0);
        });

        it("should throw when sectionId is provided without position", async () => {
            const itemId = await createTestBoardItem(testUserId, testSectionId, 0, "Orphan");

            await expect(
                boardItemsService.updateBoardItem(testUserId, itemId, { sectionId: testSectionId })
            ).rejects.toThrow("Target position needs to be defined too.");
        });

        it("should throw when updating non-existent item with position", async () => {
            await expect(
                boardItemsService.updateBoardItem(testUserId, crypto.randomUUID(), { position: 0 })
            ).rejects.toThrow("could not be found");
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

    describe("Transaction Scenario Tests", () => {
        describe("position integrity", () => {
            it("should maintain contiguous positions after mixed create, move, and delete operations", async () => {
                const itemIds = new Array<string>();
                for (let i = 0; i < 5; i++) {
                    const id = await createTestBoardItem(testUserId, testSectionId, i, `Item ${i}`);
                    itemIds.push(id);
                }
    
                await boardItemsService.updateBoardItem(testUserId, itemIds[0], { position: 3 });
    
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[0]))!.position).toBe(3);
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[1]))!.position).toBe(0);
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[2]))!.position).toBe(1);
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[3]))!.position).toBe(2);
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[4]))!.position).toBe(4);
    
                await boardItemsService.deleteBoardItem(testUserId, itemIds[2]);
    
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[0]))!.position).toBe(2);
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[1]))!.position).toBe(0);
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[3]))!.position).toBe(1);
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[4]))!.position).toBe(3);
    
                await boardItemsService.updateBoardItem(testUserId, itemIds[1], { position: 0 });
    
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[0]))!.position).toBe(2);
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[1]))!.position).toBe(0);
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[3]))!.position).toBe(1);
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[4]))!.position).toBe(3);
    
                await boardItemsService.deleteBoardItem(testUserId, itemIds[3]);
    
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[0]))!.position).toBe(1);
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[1]))!.position).toBe(0);
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[4]))!.position).toBe(2);
            });
    
            it("should maintain contiguous positions after reordering the first item to the last position in a large set", async () => {
                const itemIds = new Array<string>();
                for (let i = 0; i < 10; i++) {
                    const id = await createTestBoardItem(testUserId, testSectionId, i, `Item ${i}`);
                    itemIds.push(id);
                }
    
                await boardItemsService.updateBoardItem(testUserId, itemIds[0], { position: 9 });
    
                expect((await boardItemsService.getBoardItem(testUserId, itemIds[0]))!.position).toBe(9);
                for (let i = 1; i < 10; i++) {
                    expect((await boardItemsService.getBoardItem(testUserId, itemIds[i]))!.position).toBe(i - 1);
                }
            });
        });
    
        describe("cross-section move", () => {
            it("should correctly transfer an item between sections with contiguous positions in both", async () => {
                const sectionAId = testSectionId;
                const sectionBId = await createTestBoardSection(testUserId, testBoardId, 1, "Section B");
    
                const aItem1 = await createTestBoardItem(testUserId, sectionAId, 0, "A-Item 1");
                const aItem2 = await createTestBoardItem(testUserId, sectionAId, 1, "A-Item 2");
                const bItem1 = await createTestBoardItem(testUserId, sectionBId, 0, "B-Item 1");
                const bItem2 = await createTestBoardItem(testUserId, sectionBId, 1, "B-Item 2");
    
                await boardItemsService.updateBoardItem(testUserId, aItem1, {
                    sectionId: sectionBId,
                    position: 0,
                });
    
                expect((await boardItemsService.getBoardItem(testUserId, aItem1))!.parentId).toBe(sectionBId);
                expect((await boardItemsService.getBoardItem(testUserId, aItem1))!.position).toBe(0);
    
                expect((await boardItemsService.getBoardItem(testUserId, aItem2))!.parentId).toBe(sectionAId);
                expect((await boardItemsService.getBoardItem(testUserId, aItem2))!.position).toBe(0);
    
                expect((await boardItemsService.getBoardItem(testUserId, bItem1))!.parentId).toBe(sectionBId);
                expect((await boardItemsService.getBoardItem(testUserId, bItem1))!.position).toBe(1);
    
                expect((await boardItemsService.getBoardItem(testUserId, bItem2))!.parentId).toBe(sectionBId);
                expect((await boardItemsService.getBoardItem(testUserId, bItem2))!.position).toBe(2);
            });
        });

        describe("section reorder", () => {
            it("should preserve item positions within sections after sections are reordered", async () => {
                const section1Id = testSectionId;
                const section2Id = await createTestBoardSection(testUserId, testBoardId, 1, "Section 2");
                const section3Id = await createTestBoardSection(testUserId, testBoardId, 2, "Section 3");

                const s1i1 = await createTestBoardItem(testUserId, section1Id, 0, "S1-I1");
                const s1i2 = await createTestBoardItem(testUserId, section1Id, 1, "S1-I2");
                const s2i1 = await createTestBoardItem(testUserId, section2Id, 0, "S2-I1");
                const s2i2 = await createTestBoardItem(testUserId, section2Id, 1, "S2-I2");
                const s3i1 = await createTestBoardItem(testUserId, section3Id, 0, "S3-I1");
                const s3i2 = await createTestBoardItem(testUserId, section3Id, 1, "S3-I2");

                await boardSectionsService.updateBoardSection(testUserId, section1Id, { position: 2 });

                const sections = await boardSectionsService.getBoardSections(testUserId, testBoardId);
                expect(sections[0].id).toBe(section2Id);
                expect(sections[0].position).toBe(0);
                expect(sections[1].id).toBe(section3Id);
                expect(sections[1].position).toBe(1);
                expect(sections[2].id).toBe(section1Id);
                expect(sections[2].position).toBe(2);

                expect((await boardItemsService.getBoardItem(testUserId, s1i1))!.position).toBe(0);
                expect((await boardItemsService.getBoardItem(testUserId, s1i1))!.parentId).toBe(section1Id);
                expect((await boardItemsService.getBoardItem(testUserId, s1i2))!.position).toBe(1);
                expect((await boardItemsService.getBoardItem(testUserId, s1i2))!.parentId).toBe(section1Id);

                expect((await boardItemsService.getBoardItem(testUserId, s2i1))!.position).toBe(0);
                expect((await boardItemsService.getBoardItem(testUserId, s2i1))!.parentId).toBe(section2Id);
                expect((await boardItemsService.getBoardItem(testUserId, s2i2))!.position).toBe(1);
                expect((await boardItemsService.getBoardItem(testUserId, s2i2))!.parentId).toBe(section2Id);

                expect((await boardItemsService.getBoardItem(testUserId, s3i1))!.position).toBe(0);
                expect((await boardItemsService.getBoardItem(testUserId, s3i1))!.parentId).toBe(section3Id);
                expect((await boardItemsService.getBoardItem(testUserId, s3i2))!.position).toBe(1);
                expect((await boardItemsService.getBoardItem(testUserId, s3i2))!.parentId).toBe(section3Id);
            });
        });
    });
});