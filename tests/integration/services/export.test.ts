import { describe, it, expect, beforeEach } from "vitest";
import * as exportService from "@/app/services/export";
import { createTestUser } from "../fixtures/users";
import { createTestProject } from "../fixtures/projects";
import { createTestDocument } from "../fixtures/documents";
import { createTestBoard } from "../fixtures/boards";
import { createTestBoardSection } from "../fixtures/sections";
import { createTestBoardItem } from "../fixtures/items";
import { createTestBoardCheckItem } from "../fixtures/check-items";
import { createTestImage } from "../fixtures/images";

describe("Export Service Integration Tests", () => {
    let testUserId: string;
    let testProjectId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        testUserId = user.id;
        testProjectId = await createTestProject(testUserId, "Test Project");
    });

    describe("exportProject", () => {
        it("should export a project with all its child entities", async () => {
            const docId = await createTestDocument(testUserId, testProjectId, "Test Doc");
            const boardId = await createTestBoard(testUserId, testProjectId, "Test Board");
            const sectionId = await createTestBoardSection(testUserId, boardId, 0, "Test Section");
            const itemId = await createTestBoardItem(testUserId, sectionId, 0, "Test Item");
            await createTestBoardCheckItem(testUserId, itemId, 0, "Test Check Item");
            const imageId = await createTestImage(testUserId, testProjectId, "Test Image");

            const exported = await exportService.exportProject(testUserId, testProjectId);

            expect(exported).not.toBeNull();
            expect(exported!.id).toBe(testProjectId);
            expect(exported!.title).toBe("Test Project");

            expect(exported!.documents).toHaveLength(1);
            expect(exported!.documents[0].id).toBe(docId);
            expect(exported!.documents[0].title).toBe("Test Doc");

            expect(exported!.boards).toHaveLength(1);
            expect(exported!.boards[0].id).toBe(boardId);
            expect(exported!.boards[0].title).toBe("Test Board");

            expect(exported!.boardSections).toHaveLength(1);
            expect(exported!.boardSections[0].id).toBe(sectionId);
            expect(exported!.boardSections[0].parentId).toBe(boardId);

            expect(exported!.boardItems).toHaveLength(1);
            expect(exported!.boardItems[0].id).toBe(itemId);
            expect(exported!.boardItems[0].parentId).toBe(sectionId);

            expect(exported!.boardCheckItems).toHaveLength(1);
            expect(exported!.boardCheckItems[0].parentId).toBe(itemId);

            expect(exported!.images).toHaveLength(1);
            expect(exported!.images![0].id).toBe(imageId);
        });

        it("should export documents with correct fields", async () => {
            await createTestDocument(testUserId, testProjectId, "Doc A");
            await createTestDocument(testUserId, testProjectId, "Doc B");
            await createTestDocument(testUserId, testProjectId, "Doc C");

            const exported = await exportService.exportProject(testUserId, testProjectId);

            expect(exported!.documents).toHaveLength(3);
            const titles = exported!.documents.map((d) => d.title);
            expect(titles).toContain("Doc A");
            expect(titles).toContain("Doc B");
            expect(titles).toContain("Doc C");

            for (const doc of exported!.documents) {
                expect(doc.id).toBeDefined();
                expect(doc.projectId).toBe(testProjectId);
                expect(doc.content).toBeDefined();
            }
        });

        it("should export boards with nested sections, items, and check items", async () => {
            const boardId = await createTestBoard(testUserId, testProjectId, "Board 1");
            const sectionId = await createTestBoardSection(testUserId, boardId, 0, "Section 1");
            const itemId = await createTestBoardItem(testUserId, sectionId, 0, "Item 1");
            await createTestBoardCheckItem(testUserId, itemId, 0, "Check 1");
            await createTestBoardCheckItem(testUserId, itemId, 1, "Check 2");

            const exported = await exportService.exportProject(testUserId, testProjectId);

            expect(exported!.boards).toHaveLength(1);
            expect(exported!.boardSections).toHaveLength(1);
            expect(exported!.boardItems).toHaveLength(1);
            expect(exported!.boardCheckItems).toHaveLength(2);

            expect(exported!.boardSections[0].parentId).toBe(boardId);
            expect(exported!.boardItems[0].parentId).toBe(sectionId);
            expect(exported!.boardCheckItems[0].parentId).toBe(itemId);
            expect(exported!.boardCheckItems[1].parentId).toBe(itemId);
        });

        it("should export images with correct fields", async () => {
            await createTestImage(testUserId, testProjectId, "Image A");
            await createTestImage(testUserId, testProjectId, "Image B");

            const exported = await exportService.exportProject(testUserId, testProjectId);

            expect(exported!.images).toHaveLength(2);
            const titles = exported!.images!.map((i) => i.title);
            expect(titles).toContain("Image A");
            expect(titles).toContain("Image B");

            for (const img of exported!.images!) {
                expect(img.id).toBeDefined();
                expect(img.projectId).toBe(testProjectId);
                expect(img.blobUrl).toBeDefined();
            }
        });

        it("should return null for non-existent project", async () => {
            const exported = await exportService.exportProject(
                testUserId,
                crypto.randomUUID());
            expect(exported).toBeNull();
        });

        it("should return null for other user's project", async () => {
            const otherUser = await createTestUser();
            const otherProjectId = await createTestProject(otherUser.id, "Other Project");

            const exported = await exportService.exportProject(testUserId, otherProjectId);
            expect(exported).toBeNull();
        });

        it("should export multiple boards each with multiple sections, items, and check items per project", async () => {
            const board1Id = await createTestBoard(testUserId, testProjectId, "Board 1");
            const board2Id = await createTestBoard(testUserId, testProjectId, "Board 2");

            const board1Section1Id = await createTestBoardSection(testUserId, board1Id, 0, "B1-Section 1");
            const board1Section2Id = await createTestBoardSection(testUserId, board1Id, 1, "B1-Section 2");
            const board2Section1Id = await createTestBoardSection(testUserId, board2Id, 0, "B2-Section 1");

            const b1s1Item1Id = await createTestBoardItem(testUserId, board1Section1Id, 0, "B1S1-Item 1");
            const b1s1Item2Id = await createTestBoardItem(testUserId, board1Section1Id, 1, "B1S1-Item 2");
            const b1s2Item1Id = await createTestBoardItem(testUserId, board1Section2Id, 0, "B1S2-Item 1");
            const b2s1Item1Id = await createTestBoardItem(testUserId, board2Section1Id, 0, "B2S1-Item 1");

            await createTestBoardCheckItem(testUserId, b1s1Item1Id, 0, "B1S1I1-Check 1");
            await createTestBoardCheckItem(testUserId, b1s1Item1Id, 1, "B1S1I1-Check 2");
            await createTestBoardCheckItem(testUserId, b1s1Item2Id, 0, "B1S1I2-Check 1");
            await createTestBoardCheckItem(testUserId, b2s1Item1Id, 0, "B2S1I1-Check 1");

            const exported = await exportService.exportProject(testUserId, testProjectId);

            expect(exported).not.toBeNull();

            expect(exported!.boards).toHaveLength(2);
            const boardTitles = exported!.boards.map((b) => b.title);
            expect(boardTitles).toContain("Board 1");
            expect(boardTitles).toContain("Board 2");

            expect(exported!.boardSections).toHaveLength(3);
            const board1Sections = exported!.boardSections.filter((s) => s.parentId === board1Id);
            const board2Sections = exported!.boardSections.filter((s) => s.parentId === board2Id);
            expect(board1Sections).toHaveLength(2);
            expect(board1Sections[0].title).toBe("B1-Section 1");
            expect(board1Sections[1].title).toBe("B1-Section 2");
            expect(board2Sections).toHaveLength(1);
            expect(board2Sections[0].title).toBe("B2-Section 1");

            expect(exported!.boardItems).toHaveLength(4);
            const b1s1Items = exported!.boardItems.filter((i) => i.parentId === board1Section1Id);
            const b1s2Items = exported!.boardItems.filter((i) => i.parentId === board1Section2Id);
            const b2s1Items = exported!.boardItems.filter((i) => i.parentId === board2Section1Id);
            expect(b1s1Items).toHaveLength(2);
            expect(b1s1Items[0].title).toBe("B1S1-Item 1");
            expect(b1s1Items[1].title).toBe("B1S1-Item 2");
            expect(b1s2Items).toHaveLength(1);
            expect(b1s2Items[0].title).toBe("B1S2-Item 1");
            expect(b2s1Items).toHaveLength(1);
            expect(b2s1Items[0].title).toBe("B2S1-Item 1");

            expect(exported!.boardCheckItems).toHaveLength(4);
            const b1s1i1CheckItems = exported!.boardCheckItems.filter((c) => c.parentId === b1s1Item1Id);
            const b1s1i2CheckItems = exported!.boardCheckItems.filter((c) => c.parentId === b1s1Item2Id);
            const b2s1i1CheckItems = exported!.boardCheckItems.filter((c) => c.parentId === b2s1Item1Id);
            expect(b1s1i1CheckItems).toHaveLength(2);
            expect(b1s1i1CheckItems[0].title).toBe("B1S1I1-Check 1");
            expect(b1s1i1CheckItems[1].title).toBe("B1S1I1-Check 2");
            expect(b1s1i2CheckItems).toHaveLength(1);
            expect(b1s1i2CheckItems[0].title).toBe("B1S1I2-Check 1");
            expect(b2s1i1CheckItems).toHaveLength(1);
            expect(b2s1i1CheckItems[0].title).toBe("B2S1I1-Check 1");
        });

        it("should export a project with no child entities", async () => {
            const emptyProjectId = await createTestProject(testUserId, "Empty Project");

            const exported = await exportService.exportProject(testUserId, emptyProjectId);

            expect(exported).not.toBeNull();
            expect(exported!.documents).toHaveLength(0);
            expect(exported!.boards).toHaveLength(0);
            expect(exported!.boardSections).toHaveLength(0);
            expect(exported!.boardItems).toHaveLength(0);
            expect(exported!.boardCheckItems).toHaveLength(0);
            expect(exported!.images).toHaveLength(0);
        });
    });

    describe("exportProjectsByUser", () => {
        it("should export all projects for a user", async () => {
            const project2Id = await createTestProject(testUserId, "Project 2");
            await createTestDocument(testUserId, testProjectId, "Doc 1");
            await createTestDocument(testUserId, project2Id, "Doc 2");

            const exported = await exportService.exportProjectsByUser(testUserId);

            expect(exported).toHaveLength(2);
            const titles = exported.map((p) => p.title);
            expect(titles).toContain("Test Project");
            expect(titles).toContain("Project 2");

            const firstProject = exported.find((p) => p.id === testProjectId);
            expect(firstProject?.documents).toHaveLength(1);
            expect(firstProject?.documents[0].title).toBe("Doc 1");

            const secondProject = exported.find((p) => p.id === project2Id);
            expect(secondProject?.documents).toHaveLength(1);
            expect(secondProject?.documents[0].title).toBe("Doc 2");
        });

        it("should return empty array for user with no projects", async () => {
            const newUser = await createTestUser();
            const exported = await exportService.exportProjectsByUser(newUser.id);
            expect(exported).toHaveLength(0);
        });

        it("should only return projects for the requesting user", async () => {
            const otherUser = await createTestUser();
            await createTestProject(otherUser.id, "Other User Project");

            const exported = await exportService.exportProjectsByUser(testUserId);

            const otherTitles = exported.map((p) => p.title);
            expect(otherTitles).not.toContain("Other User Project");
        });

        it("should group child entities under the correct project", async () => {
            const project2Id = await createTestProject(testUserId, "Project 2");
            const boardId = await createTestBoard(testUserId, testProjectId, "Board in Project 1");
            await createTestDocument(testUserId, project2Id, "Doc in Project 2");

            const exported = await exportService.exportProjectsByUser(testUserId);

            const firstProject = exported.find((p) => p.id === testProjectId);
            expect(firstProject?.boards).toHaveLength(1);
            expect(firstProject?.boards[0].title).toBe("Board in Project 1");
            expect(firstProject?.documents).toHaveLength(0);

            const secondProject = exported.find((p) => p.id === project2Id);
            expect(secondProject?.documents).toHaveLength(1);
            expect(secondProject?.documents[0].title).toBe("Doc in Project 2");
            expect(secondProject?.boards).toHaveLength(0);
        });

        it("should export multiple boards each with multiple sections, items, and check items", async () => {
            const board1Id = await createTestBoard(testUserId, testProjectId, "Board 1");
            const board2Id = await createTestBoard(testUserId, testProjectId, "Board 2");

            const board1Section1Id = await createTestBoardSection(testUserId, board1Id, 0, "B1-Section 1");
            const board1Section2Id = await createTestBoardSection(testUserId, board1Id, 1, "B1-Section 2");
            const board2Section1Id = await createTestBoardSection(testUserId, board2Id, 0, "B2-Section 1");

            const b1s1Item1Id = await createTestBoardItem(testUserId, board1Section1Id, 0, "B1S1-Item 1");
            const b1s1Item2Id = await createTestBoardItem(testUserId, board1Section1Id, 1, "B1S1-Item 2");
            const b1s2Item1Id = await createTestBoardItem(testUserId, board1Section2Id, 0, "B1S2-Item 1");
            const b2s1Item1Id = await createTestBoardItem(testUserId, board2Section1Id, 0, "B2S1-Item 1");

            await createTestBoardCheckItem(testUserId, b1s1Item1Id, 0, "B1S1I1-Check 1");
            await createTestBoardCheckItem(testUserId, b1s1Item1Id, 1, "B1S1I1-Check 2");
            await createTestBoardCheckItem(testUserId, b1s1Item2Id, 0, "B1S1I2-Check 1");
            await createTestBoardCheckItem(testUserId, b2s1Item1Id, 0, "B2S1I1-Check 1");

            const exported = await exportService.exportProjectsByUser(testUserId);

            expect(exported).toHaveLength(1);
            const project = exported[0];

            expect(project.boards).toHaveLength(2);
            const boardTitles = project.boards.map((b) => b.title);
            expect(boardTitles).toContain("Board 1");
            expect(boardTitles).toContain("Board 2");

            expect(project.boardSections).toHaveLength(3);
            const board1Sections = project.boardSections.filter((s) => s.parentId === board1Id);
            const board2Sections = project.boardSections.filter((s) => s.parentId === board2Id);
            expect(board1Sections).toHaveLength(2);
            expect(board1Sections[0].title).toBe("B1-Section 1");
            expect(board1Sections[1].title).toBe("B1-Section 2");
            expect(board2Sections).toHaveLength(1);
            expect(board2Sections[0].title).toBe("B2-Section 1");

            expect(project.boardItems).toHaveLength(4);
            const b1s1Items = project.boardItems.filter((i) => i.parentId === board1Section1Id);
            const b1s2Items = project.boardItems.filter((i) => i.parentId === board1Section2Id);
            const b2s1Items = project.boardItems.filter((i) => i.parentId === board2Section1Id);
            expect(b1s1Items).toHaveLength(2);
            expect(b1s1Items[0].title).toBe("B1S1-Item 1");
            expect(b1s1Items[1].title).toBe("B1S1-Item 2");
            expect(b1s2Items).toHaveLength(1);
            expect(b1s2Items[0].title).toBe("B1S2-Item 1");
            expect(b2s1Items).toHaveLength(1);
            expect(b2s1Items[0].title).toBe("B2S1-Item 1");

            expect(project.boardCheckItems).toHaveLength(4);
            const b1s1i1CheckItems = project.boardCheckItems.filter((c) => c.parentId === b1s1Item1Id);
            const b1s1i2CheckItems = project.boardCheckItems.filter((c) => c.parentId === b1s1Item2Id);
            const b2s1i1CheckItems = project.boardCheckItems.filter((c) => c.parentId === b2s1Item1Id);
            expect(b1s1i1CheckItems).toHaveLength(2);
            expect(b1s1i1CheckItems[0].title).toBe("B1S1I1-Check 1");
            expect(b1s1i1CheckItems[1].title).toBe("B1S1I1-Check 2");
            expect(b1s1i2CheckItems).toHaveLength(1);
            expect(b1s1i2CheckItems[0].title).toBe("B1S1I2-Check 1");
            expect(b2s1i1CheckItems).toHaveLength(1);
            expect(b2s1i1CheckItems[0].title).toBe("B2S1I1-Check 1");
        });
    });
});