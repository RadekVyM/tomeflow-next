import { describe, it, expect, beforeEach } from "vitest";
import * as boardSectionsService from "@/app/services/board-sections";
import * as boardItemsService from "@/app/services/board-items";
import { createTestUser } from "../fixtures/users";
import { createTestProject } from "../fixtures/projects";
import { createTestBoard } from "../fixtures/boards";
import { createTestBoardSection } from "../fixtures/sections";
import { createTestBoardItem } from "../fixtures/items";
import { createTestBoardCheckItem } from "../fixtures/check-items";
import { db } from "@/db";
import { projectBoardItems } from "@/db/schema";
import { eq } from "drizzle-orm";

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

        it("should update position without changing title", async () => {
            const firstSectionId = await createTestBoardSection(testUserId, testBoardId, 0, "First");
            const secondSectionId = await createTestBoardSection(testUserId, testBoardId, 1, "Second");

            await boardSectionsService.updateBoardSection(testUserId, firstSectionId, { position: 1 });

            const first = await boardSectionsService.getBoardSectionTitle(testUserId, firstSectionId);
            expect(first?.title).toBe("First");

            const sections = await boardSectionsService.getBoardSections(testUserId, testBoardId);
            expect(sections[0].id).toBe(secondSectionId);
            expect(sections[1].id).toBe(firstSectionId);
            expect(sections[1].position).toBe(1);
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

        it("should throw when updating non-existent section with position", async () => {
            await expect(
                boardSectionsService.updateBoardSection(testUserId, crypto.randomUUID(), { position: 0 })
            ).rejects.toThrow("could not be found");
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

        it("should delete the only section in a board", async () => {
            const sectionId = await createTestBoardSection(testUserId, testBoardId, 0, "Solo Section");

            await boardSectionsService.deleteBoardSection(testUserId, sectionId);

            const sections = await boardSectionsService.getBoardSections(testUserId, testBoardId);
            expect(sections).toHaveLength(0);
        });
    });

    describe("delete parent section with children", () => {
        it("should reindex remaining sections and preserve items in surviving sections", async () => {
            const section1Id = await createTestBoardSection(testUserId, testBoardId, 1, "Section 1");
            const section2Id = await createTestBoardSection(testUserId, testBoardId, 1, "Section 2 (middle)");
            const section3Id = await createTestBoardSection(testUserId, testBoardId, 2, "Section 3");

            const s2i1 = await createTestBoardItem(testUserId, section2Id, 0, "S2-I1");
            const s2i2 = await createTestBoardItem(testUserId, section2Id, 1, "S2-I2");
            await createTestBoardCheckItem(testUserId, s2i1, 0, "S2I1-Check");

            const s3i1 = await createTestBoardItem(testUserId, section3Id, 0, "S3-I1");

            await boardSectionsService.deleteBoardSection(testUserId, section2Id);

            const sections = await boardSectionsService.getBoardSections(testUserId, testBoardId);
            expect(sections).toHaveLength(2);
            expect(sections[0].id).toBe(section1Id);
            expect(sections[0].position).toBe(0);
            expect(sections[1].id).toBe(section3Id);
            expect(sections[1].position).toBe(1);

            expect((await db.select().from(projectBoardItems).where(eq(projectBoardItems.id, s2i1)))).toHaveLength(0);
            expect((await db.select().from(projectBoardItems).where(eq(projectBoardItems.id, s2i2)))).toHaveLength(0);

            const s3Item = await boardItemsService.getBoardItem(testUserId, s3i1);
            expect(s3Item).toBeDefined();
            expect(s3Item!.position).toBe(0);
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