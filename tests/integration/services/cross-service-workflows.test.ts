import { describe, it, expect, beforeEach } from "vitest";
import { createTestUser } from "../fixtures/users";
import { createTestProject } from "../fixtures/projects";
import { createTestBoard } from "../fixtures/boards";
import { createTestBoardSection } from "../fixtures/sections";
import { createTestBoardItem } from "../fixtures/items";
import { createTestBoardCheckItem } from "../fixtures/check-items";
import { createTestDocument } from "../fixtures/documents";
import { createTestImage } from "../fixtures/images";
import * as projectsService from "@/app/services/projects";
import * as boardsService from "@/app/services/boards";
import * as boardSectionsService from "@/app/services/board-sections";
import * as boardItemsService from "@/app/services/board-items";
import * as boardCheckItemsService from "@/app/services/board-check-items";
import * as documentsService from "@/app/services/documents";
import * as imagesService from "@/app/services/images";
import * as exportService from "@/app/services/export";
import * as importService from "@/app/services/import";

describe("Cross-Service Workflow Integration Tests", () => {
    let testUserId: string;
    let testProjectId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        testUserId = user.id;
        testProjectId = await createTestProject(testUserId, "Workflow Project");
    });

    describe("full project lifecycle", () => {
        it("should support create, read, update, and bottom-up delete across all services", async () => {
            const boardId = await createTestBoard(testUserId, testProjectId, "Lifecycle Board");
            const sectionId = await createTestBoardSection(testUserId, boardId, 0, "Lifecycle Section");
            const itemId = await createTestBoardItem(testUserId, sectionId, 0, "Lifecycle Item");
            const checkItemId = await createTestBoardCheckItem(testUserId, itemId, 0, "Lifecycle Check");
            const docId = await createTestDocument(testUserId, testProjectId, "Lifecycle Doc");
            const imageId = await createTestImage(testUserId, testProjectId, "Lifecycle Image");

            const project = await projectsService.getProject(testUserId, testProjectId);
            expect(project).toBeDefined();
            expect(project!.title).toBe("Workflow Project");

            const board = await boardsService.getBoard(testUserId, boardId);
            expect(board).toBeDefined();
            expect(board!.title).toBe("Lifecycle Board");

            const section = await boardSectionsService.getBoardSectionsWithItems(testUserId, boardId);
            expect(section).toHaveLength(1);
            expect(section[0].title).toBe("Lifecycle Section");

            const item = await boardItemsService.getBoardItem(testUserId, itemId);
            expect(item).toBeDefined();
            expect(item!.title).toBe("Lifecycle Item");

            const checkItems = await boardCheckItemsService.getBoardItemCheckItems(testUserId, itemId);
            expect(checkItems).toHaveLength(1);
            expect(checkItems[0].title).toBe("Lifecycle Check");

            const doc = await documentsService.getDocument(testUserId, docId);
            expect(doc).toBeDefined();
            expect(doc!.title).toBe("Lifecycle Doc");

            const image = await imagesService.getImage(testUserId, imageId);
            expect(image).toBeDefined();
            expect(image!.title).toBe("Lifecycle Image");

            await boardsService.updateBoard(testUserId, boardId, { title: "Updated Board" });
            await boardItemsService.updateBoardItem(testUserId, itemId, { isDone: true });
            await documentsService.updateDocument(testUserId, docId, { content: "Updated content" });
            await boardCheckItemsService.updateBoardCheckItem(testUserId, checkItemId, { title: "Updated Check" });

            expect((await boardsService.getBoard(testUserId, boardId))!.title).toBe("Updated Board");
            expect((await boardItemsService.getBoardItem(testUserId, itemId))!.isDone).toBe(true);
            expect((await documentsService.getDocument(testUserId, docId))!.content).toBe("Updated content");
            expect((await boardCheckItemsService.getBoardItemCheckItems(testUserId, itemId))[0].title).toBe("Updated Check");

            await boardCheckItemsService.deleteBoardCheckItem(testUserId, checkItemId);
            expect(await boardCheckItemsService.getBoardItemCheckItems(testUserId, itemId)).toHaveLength(0);

            await boardItemsService.deleteBoardItem(testUserId, itemId);
            expect(await boardItemsService.getBoardItem(testUserId, itemId)).toBeUndefined();

            await boardSectionsService.deleteBoardSection(testUserId, sectionId);
            expect(await boardSectionsService.getBoardSections(testUserId, boardId)).toHaveLength(0);

            await boardsService.deleteBoard(testUserId, boardId);
            expect(await boardsService.getBoard(testUserId, boardId)).toBeUndefined();

            await documentsService.deleteDocument(testUserId, docId);
            expect(await documentsService.getDocument(testUserId, docId)).toBeUndefined();

            await imagesService.deleteImage(testUserId, imageId);
            expect(await imagesService.getImage(testUserId, imageId)).toBeUndefined();

            await projectsService.deleteProject(testUserId, testProjectId);
            expect(await projectsService.getProject(testUserId, testProjectId)).toBeUndefined();
        });
    });

    describe("import-export round-trip", () => {
        it("should preserve full structure, positions, and field values", async () => {
            const boardId = await createTestBoard(testUserId, testProjectId, "Round-trip Board");
            const section1Id = await createTestBoardSection(testUserId, boardId, 0, "Section A");
            const section2Id = await createTestBoardSection(testUserId, boardId, 1, "Section B");
            const item1Id = await createTestBoardItem(testUserId, section1Id, 0, "Item A1");
            const item2Id = await createTestBoardItem(testUserId, section1Id, 1, "Item A2");
            const item3Id = await createTestBoardItem(testUserId, section2Id, 0, "Item B1");
            await createTestBoardCheckItem(testUserId, item1Id, 0, "Check A1");
            await createTestBoardCheckItem(testUserId, item1Id, 1, "Check A2");
            await createTestBoardCheckItem(testUserId, item3Id, 0, "Check B1");
            await createTestDocument(testUserId, testProjectId, "Round-trip Doc");

            const exported = await exportService.exportProject(testUserId, testProjectId);
            expect(exported).not.toBeNull();
            expect(exported!.title).toBe("Workflow Project");

            const freshUser = await createTestUser();

            const mapping = await importService.importProjects(freshUser.id, [exported!]);

            expect(mapping).toHaveLength(1);
            const newProjectId = mapping[0].new;
            expect(newProjectId).not.toBe(testProjectId);

            const newBoards = await boardsService.getAllProjectBoards(freshUser.id, newProjectId);
            expect(newBoards).toHaveLength(1);
            expect(newBoards[0].title).toBe("Round-trip Board");

            const sections = await boardSectionsService.getBoardSectionsWithItems(freshUser.id, newBoards[0].id);
            expect(sections).toHaveLength(2);
            expect(sections[0].title).toBe("Section A");
            expect(sections[0].position).toBe(0);
            expect(sections[1].title).toBe("Section B");
            expect(sections[1].position).toBe(1);

            expect(sections[0].items).toHaveLength(2);
            expect(sections[0].items[0].title).toBe("Item A1");
            expect(sections[0].items[0].position).toBe(0);
            expect(sections[0].items[1].title).toBe("Item A2");
            expect(sections[0].items[1].position).toBe(1);
            expect(sections[1].items).toHaveLength(1);
            expect(sections[1].items[0].title).toBe("Item B1");
            expect(sections[1].items[0].position).toBe(0);

            const checkItemsA1 = await boardCheckItemsService.getBoardItemCheckItems(freshUser.id, sections[0].items[0].id);
            expect(checkItemsA1).toHaveLength(2);
            expect(checkItemsA1[0].title).toBe("Check A1");
            expect(checkItemsA1[0].position).toBe(0);
            expect(checkItemsA1[1].title).toBe("Check A2");
            expect(checkItemsA1[1].position).toBe(1);

            const checkItemsB1 = await boardCheckItemsService.getBoardItemCheckItems(freshUser.id, sections[1].items[0].id);
            expect(checkItemsB1).toHaveLength(1);
            expect(checkItemsB1[0].title).toBe("Check B1");

            const newDocs = await documentsService.getAllProjectDocuments(freshUser.id, newProjectId);
            expect(newDocs).toHaveLength(1);
            expect(newDocs[0].title).toBe("Round-trip Doc");

            const orphanCheck = await projectsService.getProject(testUserId, newProjectId);
            expect(orphanCheck).toBeUndefined();
        });
    });

    describe("project image cleanup", () => {
        it("should delete all project images when project is deleted", async () => {
            const image1Id = await createTestImage(testUserId, testProjectId, "Image 1");
            const image2Id = await createTestImage(testUserId, testProjectId, "Image 2");

            const otherProjectId = await createTestProject(testUserId, "Other Project");
            const otherImageId = await createTestImage(testUserId, otherProjectId, "Other Image");

            await projectsService.deleteProject(testUserId, testProjectId);

            const project1Images = await imagesService.getImagesFromProject(testUserId, testProjectId);
            expect(project1Images).toHaveLength(0);

            const otherImages = await imagesService.getImagesFromProject(testUserId, otherProjectId);
            expect(otherImages).toHaveLength(1);
            expect(otherImages[0].id).toBe(otherImageId);
        });
    });

    describe("recent items ordering", () => {
        it("should return recent projects, boards, and documents in correct order", async () => {
            const project2Id = await createTestProject(testUserId, "Project B");
            const project3Id = await createTestProject(testUserId, "Project C");

            await projectsService.getProject(testUserId, project3Id);
            await new Promise((r) => setTimeout(r, 10));
            await projectsService.getProject(testUserId, testProjectId);
            await new Promise((r) => setTimeout(r, 10));
            await projectsService.getProject(testUserId, project2Id);

            const recentProjects = await projectsService.getRecentProjects(testUserId);
            expect(recentProjects[0].id).toBe(project2Id);
            expect(recentProjects[1].id).toBe(testProjectId);
            expect(recentProjects[2].id).toBe(project3Id);

            const board1Id = await createTestBoard(testUserId, testProjectId, "Board A");
            const board2Id = await createTestBoard(testUserId, testProjectId, "Board B");
            const board3Id = await createTestBoard(testUserId, testProjectId, "Board C");

            await boardsService.getBoard(testUserId, board3Id);
            await new Promise((r) => setTimeout(r, 10));
            await boardsService.getBoard(testUserId, board1Id);
            await new Promise((r) => setTimeout(r, 10));
            await boardsService.getBoard(testUserId, board2Id);

            const recentBoards = await boardsService.getRecentBoards(testUserId);
            expect(recentBoards[0].id).toBe(board2Id);
            expect(recentBoards[1].id).toBe(board1Id);
            expect(recentBoards[2].id).toBe(board3Id);

            const doc1Id = await createTestDocument(testUserId, testProjectId, "Doc A");
            const doc2Id = await createTestDocument(testUserId, testProjectId, "Doc B");

            await documentsService.getDocument(testUserId, doc2Id);
            await new Promise((r) => setTimeout(r, 10));
            await documentsService.getDocument(testUserId, doc1Id);

            const recentDocs = await documentsService.getRecentDocuments(testUserId);
            expect(recentDocs[0].id).toBe(doc1Id);
            expect(recentDocs[1].id).toBe(doc2Id);
        });
    });

    describe("multi-user isolation at scale", () => {
        it("should keep each user's full hierarchy isolated from other users", async () => {
            const userA = await createTestUser();
            const userB = await createTestUser();

            const aProject1 = await createTestProject(userA.id, "A-Project 1");
            const aBoard1 = await createTestBoard(userA.id, aProject1, "A-Board 1");
            const aSection1 = await createTestBoardSection(userA.id, aBoard1, 0, "A-Section");
            const aItem1 = await createTestBoardItem(userA.id, aSection1, 0, "A-Item");
            await createTestBoardCheckItem(userA.id, aItem1, 0, "A-Check");
            await createTestDocument(userA.id, aProject1, "A-Doc");

            const aProject2 = await createTestProject(userA.id, "A-Project 2");
            await createTestBoard(userA.id, aProject2, "A-Board 2");

            const bProject1 = await createTestProject(userB.id, "B-Project 1");
            const bBoard1 = await createTestBoard(userB.id, bProject1, "B-Board 1");
            const bSection1 = await createTestBoardSection(userB.id, bBoard1, 0, "B-Section");
            const bItem1 = await createTestBoardItem(userB.id, bSection1, 0, "B-Item");
            await createTestDocument(userB.id, bProject1, "B-Doc");

            const bProject2 = await createTestProject(userB.id, "B-Project 2");

            const aProjects = await projectsService.getAllProjects(userA.id);
            const bProjects = await projectsService.getAllProjects(userB.id);

            expect(aProjects).toHaveLength(2);
            expect(bProjects).toHaveLength(2);

            const aProjectIds = aProjects.map((p) => p.id);
            expect(aProjectIds).not.toContain(bProject1);
            expect(aProjectIds).not.toContain(bProject2);

            const aBoardsForP1 = await boardsService.getAllProjectBoards(userA.id, aProject1);
            expect(aBoardsForP1).toHaveLength(1);
            expect(aBoardsForP1[0].title).toBe("A-Board 1");

            const aBoardsForP2 = await boardsService.getAllProjectBoards(userA.id, aProject2);
            expect(aBoardsForP2).toHaveLength(1);

            const bBoardsForP1 = await boardsService.getAllProjectBoards(userB.id, bProject1);
            expect(bBoardsForP1).toHaveLength(1);

            const bBoardsForP2 = await boardsService.getAllProjectBoards(userB.id, bProject2);
            expect(bBoardsForP2).toHaveLength(0);

            const aSections = await boardSectionsService.getBoardSectionsWithItems(userA.id, aBoard1);
            expect(aSections).toHaveLength(1);
            expect(aSections[0].items).toHaveLength(1);
            expect(aSections[0].items[0].title).toBe("A-Item");

            const aCheckItems = await boardCheckItemsService.getBoardItemCheckItems(userA.id, aItem1);
            expect(aCheckItems).toHaveLength(1);
            expect(aCheckItems[0].title).toBe("A-Check");

            const aDocsForP1 = await documentsService.getAllProjectDocuments(userA.id, aProject1);
            expect(aDocsForP1).toHaveLength(1);
            expect(aDocsForP1[0].title).toBe("A-Doc");

            const bSections = await boardSectionsService.getBoardSectionsWithItems(userB.id, bBoard1);
            expect(bSections).toHaveLength(1);
            expect(bSections[0].items).toHaveLength(1);
            expect(bSections[0].items[0].title).toBe("B-Item");

            const bDocsForP1 = await documentsService.getAllProjectDocuments(userB.id, bProject1);
            expect(bDocsForP1).toHaveLength(1);
            expect(bDocsForP1[0].title).toBe("B-Doc");

            const aSectionsForB = await boardSectionsService.getBoardSections(userA.id, bBoard1);
            expect(aSectionsForB).toHaveLength(0);

            const aDocsForB = await documentsService.getAllProjectDocuments(userA.id, bProject1);
            expect(aDocsForB).toHaveLength(0);
        });
    });
});