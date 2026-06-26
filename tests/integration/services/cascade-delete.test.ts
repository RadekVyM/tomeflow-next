import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/db";
import {
    projects,
    projectDocuments,
    projectBoards,
    projectBoardSections,
    projectBoardItems,
    projectBoardCheckItems,
    vercelImages,
    users,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import * as projectsService from "@/app/services/projects";
import * as boardsService from "@/app/services/boards";
import * as boardSectionsService from "@/app/services/board-sections";
import * as boardItemsService from "@/app/services/board-items";
import { createTestUser } from "../fixtures/users";
import { createTestProject } from "../fixtures/projects";
import { createTestBoard } from "../fixtures/boards";
import { createTestBoardSection } from "../fixtures/sections";
import { createTestBoardItem } from "../fixtures/items";
import { createTestBoardCheckItem } from "../fixtures/check-items";
import { createTestDocument } from "../fixtures/documents";
import { createTestImage } from "../fixtures/images";

describe("Cascade Delete Integration Tests", () => {
    let testUserId: string;
    let testProjectId: string;
    let testBoardId: string;
    let testSectionId: string;
    let testItemId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        testUserId = user.id;
        testProjectId = await createTestProject(testUserId, "Test Project");
        testBoardId = await createTestBoard(testUserId, testProjectId, "Test Board");
        testSectionId = await createTestBoardSection(testUserId, testBoardId, 0, "Test Section");
        testItemId = await createTestBoardItem(testUserId, testSectionId, 0, "Test Item");
    });

    describe("project deletion", () => {
        it("should cascade to boards, documents, sections, items, check-items, and images", async () => {
            const docId = await createTestDocument(testUserId, testProjectId, "Doc");
            const imageId = await createTestImage(testUserId, testProjectId, "Image");
            const checkItemId = await createTestBoardCheckItem(testUserId, testItemId, 0, "Check");

            const siblingProjectId = await createTestProject(testUserId, "Sibling");
            const siblingBoardId = await createTestBoard(testUserId, siblingProjectId, "Sibling Board");

            await projectsService.deleteProject(testUserId, testProjectId);

            expect((await db.select().from(projects).where(eq(projects.id, testProjectId)))).toHaveLength(0);
            expect((await db.select().from(projectBoards).where(eq(projectBoards.id, testBoardId)))).toHaveLength(0);
            expect((await db.select().from(projectDocuments).where(eq(projectDocuments.id, docId)))).toHaveLength(0);
            expect((await db.select().from(vercelImages).where(eq(vercelImages.id, imageId)))).toHaveLength(0);
            expect((await db.select().from(projectBoardSections).where(eq(projectBoardSections.id, testSectionId)))).toHaveLength(0);
            expect((await db.select().from(projectBoardItems).where(eq(projectBoardItems.id, testItemId)))).toHaveLength(0);
            expect((await db.select().from(projectBoardCheckItems).where(eq(projectBoardCheckItems.id, checkItemId)))).toHaveLength(0);

            expect((await db.select().from(projects).where(eq(projects.id, siblingProjectId)))).toHaveLength(1);
            expect((await db.select().from(projectBoards).where(eq(projectBoards.id, siblingBoardId)))).toHaveLength(1);
        });
    });

    describe("board deletion", () => {
        it("should cascade to sections, items, and check-items", async () => {
            const checkItemId = await createTestBoardCheckItem(testUserId, testItemId, 0, "Check");

            const siblingBoardId = await createTestBoard(testUserId, testProjectId, "Sibling Board");
            const siblingSectionId = await createTestBoardSection(testUserId, siblingBoardId, 0, "Sibling Section");
            const siblingItemId = await createTestBoardItem(testUserId, siblingSectionId, 0, "Sibling Item");

            await boardsService.deleteBoard(testUserId, testBoardId);

            expect((await db.select().from(projectBoards).where(eq(projectBoards.id, testBoardId)))).toHaveLength(0);
            expect((await db.select().from(projectBoardSections).where(eq(projectBoardSections.id, testSectionId)))).toHaveLength(0);
            expect((await db.select().from(projectBoardItems).where(eq(projectBoardItems.id, testItemId)))).toHaveLength(0);
            expect((await db.select().from(projectBoardCheckItems).where(eq(projectBoardCheckItems.id, checkItemId)))).toHaveLength(0);

            expect((await db.select().from(projectBoards).where(eq(projectBoards.id, siblingBoardId)))).toHaveLength(1);
            expect((await db.select().from(projectBoardSections).where(eq(projectBoardSections.id, siblingSectionId)))).toHaveLength(1);
            expect((await db.select().from(projectBoardItems).where(eq(projectBoardItems.id, siblingItemId)))).toHaveLength(1);
        });
    });

    describe("section deletion", () => {
        it("should cascade to items and check-items", async () => {
            const checkItemId = await createTestBoardCheckItem(testUserId, testItemId, 0, "Check");

            const siblingSectionId = await createTestBoardSection(testUserId, testBoardId, 1, "Sibling Section");
            const siblingItemId = await createTestBoardItem(testUserId, siblingSectionId, 0, "Sibling Item");

            await boardSectionsService.deleteBoardSection(testUserId, testSectionId);

            expect((await db.select().from(projectBoardSections).where(eq(projectBoardSections.id, testSectionId)))).toHaveLength(0);
            expect((await db.select().from(projectBoardItems).where(eq(projectBoardItems.id, testItemId)))).toHaveLength(0);
            expect((await db.select().from(projectBoardCheckItems).where(eq(projectBoardCheckItems.id, checkItemId)))).toHaveLength(0);

            expect((await db.select().from(projectBoardSections).where(eq(projectBoardSections.id, siblingSectionId)))).toHaveLength(1);
            expect((await db.select().from(projectBoardItems).where(eq(projectBoardItems.id, siblingItemId)))).toHaveLength(1);
        });
    });

    describe("item deletion", () => {
        it("should cascade to check-items", async () => {
            const checkItemId = await createTestBoardCheckItem(testUserId, testItemId, 0, "Check");

            const siblingItemId = await createTestBoardItem(testUserId, testSectionId, 1, "Sibling Item");
            const siblingCheckItemId = await createTestBoardCheckItem(testUserId, siblingItemId, 0, "Sibling Check");

            await boardItemsService.deleteBoardItem(testUserId, testItemId);

            expect((await db.select().from(projectBoardItems).where(eq(projectBoardItems.id, testItemId)))).toHaveLength(0);
            expect((await db.select().from(projectBoardCheckItems).where(eq(projectBoardCheckItems.id, checkItemId)))).toHaveLength(0);

            expect((await db.select().from(projectBoardItems).where(eq(projectBoardItems.id, siblingItemId)))).toHaveLength(1);
            expect((await db.select().from(projectBoardCheckItems).where(eq(projectBoardCheckItems.id, siblingCheckItemId)))).toHaveLength(1);
        });
    });

    describe("user deletion", () => {
        it("should cascade to all user-owned data across all entity types", async () => {
            const userToDelete = await createTestUser();
            const survivor = await createTestUser();

            const projectDeleted = await createTestProject(userToDelete.id, "Will be deleted");
            const boardDeleted = await createTestBoard(userToDelete.id, projectDeleted, "Board gone");
            const sectionDeleted = await createTestBoardSection(userToDelete.id, boardDeleted, 0, "Section gone");
            const itemDeleted = await createTestBoardItem(userToDelete.id, sectionDeleted, 0, "Item gone");
            const checkDeleted = await createTestBoardCheckItem(userToDelete.id, itemDeleted, 0, "Check gone");
            const docDeleted = await createTestDocument(userToDelete.id, projectDeleted, "Doc gone");
            const imgDeleted = await createTestImage(userToDelete.id, projectDeleted, "Img gone");

            const projectSurvivor = await createTestProject(survivor.id, "Survivor");
            const boardSurvivor = await createTestBoard(survivor.id, projectSurvivor, "Board lives");
            const sectionSurvivor = await createTestBoardSection(survivor.id, boardSurvivor, 0, "Section lives");
            const itemSurvivor = await createTestBoardItem(survivor.id, sectionSurvivor, 0, "Item lives");

            await db.delete(users).where(eq(users.id, userToDelete.id));

            expect((await db.select().from(users).where(eq(users.id, userToDelete.id)))).toHaveLength(0);
            expect((await db.select().from(projects).where(eq(projects.id, projectDeleted)))).toHaveLength(0);
            expect((await db.select().from(projectBoards).where(eq(projectBoards.id, boardDeleted)))).toHaveLength(0);
            expect((await db.select().from(projectBoardSections).where(eq(projectBoardSections.id, sectionDeleted)))).toHaveLength(0);
            expect((await db.select().from(projectBoardItems).where(eq(projectBoardItems.id, itemDeleted)))).toHaveLength(0);
            expect((await db.select().from(projectBoardCheckItems).where(eq(projectBoardCheckItems.id, checkDeleted)))).toHaveLength(0);
            expect((await db.select().from(projectDocuments).where(eq(projectDocuments.id, docDeleted)))).toHaveLength(0);
            expect((await db.select().from(vercelImages).where(eq(vercelImages.id, imgDeleted)))).toHaveLength(0);

            expect((await db.select().from(users).where(eq(users.id, survivor.id)))).toHaveLength(1);
            expect((await db.select().from(projects).where(eq(projects.id, projectSurvivor)))).toHaveLength(1);
            expect((await db.select().from(projectBoards).where(eq(projectBoards.id, boardSurvivor)))).toHaveLength(1);
            expect((await db.select().from(projectBoardSections).where(eq(projectBoardSections.id, sectionSurvivor)))).toHaveLength(1);
            expect((await db.select().from(projectBoardItems).where(eq(projectBoardItems.id, itemSurvivor)))).toHaveLength(1);
        });
    });
});