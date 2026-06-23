import { describe, it, expect, beforeEach } from "vitest";
import * as importService from "@/app/services/import";
import * as projectsService from "@/app/services/projects";
import * as documentsService from "@/app/services/documents";
import * as boardsService from "@/app/services/boards";
import * as boardSectionsService from "@/app/services/board-sections";
import * as boardCheckItemsService from "@/app/services/board-check-items";
import { createTestUser } from "../fixtures/users";
import type { ExportedProject } from "@/app/types/export/ExportedProject";

describe("Import Service Integration Tests", () => {
    let testUserId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        testUserId = user.id;
    });

    describe("importProjects", () => {
        it("should import a project with all entity types including multiple boards, sections, items, and check items", async () => {
            const oldProjectId = crypto.randomUUID();
            const oldBoard1Id = crypto.randomUUID();
            const oldBoard2Id = crypto.randomUUID();
            const oldSection1Id = crypto.randomUUID();
            const oldSection2Id = crypto.randomUUID();
            const oldSection3Id = crypto.randomUUID();
            const oldItem1Id = crypto.randomUUID();
            const oldItem2Id = crypto.randomUUID();
            const oldItem3Id = crypto.randomUUID();
            const oldCheck1Id = crypto.randomUUID();
            const oldCheck2Id = crypto.randomUUID();
            const oldCheck3Id = crypto.randomUUID();

            const projectData: ExportedProject = {
                id: oldProjectId,
                title: "Imported Project",
                description: "A full import test",
                documents: [
                    { id: crypto.randomUUID(), projectId: oldProjectId, title: "Doc 1", content: "Content 1" },
                    { id: crypto.randomUUID(), projectId: oldProjectId, title: "Doc 2", content: "Content 2" },
                ],
                boards: [
                    { id: oldBoard1Id, projectId: oldProjectId, title: "Board 1" },
                    { id: oldBoard2Id, projectId: oldProjectId, title: "Board 2" },
                ],
                boardSections: [
                    { id: oldSection1Id, parentId: oldBoard1Id, title: "Section 1", position: 0 },
                    { id: oldSection2Id, parentId: oldBoard1Id, title: "Section 2", position: 1 },
                    { id: oldSection3Id, parentId: oldBoard2Id, title: "Section 3", position: 0 },
                ],
                boardItems: [
                    { id: oldItem1Id, parentId: oldSection1Id, title: "Item 1", position: 0, isDone: false, description: "First item" },
                    { id: oldItem2Id, parentId: oldSection2Id, title: "Item 2", position: 0, isDone: true, description: null },
                    { id: oldItem3Id, parentId: oldSection3Id, title: "Item 3", position: 0, isDone: false, description: null },
                ],
                boardCheckItems: [
                    { id: oldCheck1Id, parentId: oldItem1Id, title: "Check 1", position: 0, isDone: false },
                    { id: oldCheck2Id, parentId: oldItem1Id, title: "Check 2", position: 1, isDone: true },
                    { id: oldCheck3Id, parentId: oldItem2Id, title: "Check 3", position: 0, isDone: false },
                ],
            };

            const mapping = await importService.importProjects(testUserId, [projectData]);

            expect(mapping).toHaveLength(1);
            expect(mapping[0].old).toBe(oldProjectId);
            expect(mapping[0].new).not.toBe(oldProjectId);

            const newProjectId = mapping[0].new;

            const project = await projectsService.getProject(testUserId, newProjectId);
            expect(project).toBeDefined();
            expect(project!.title).toBe("Imported Project");
            expect(project!.description).toBe("A full import test");
            expect(project!.userId).toBe(testUserId);

            const docs = await documentsService.getAllProjectDocuments(testUserId, newProjectId);
            expect(docs).toHaveLength(2);
            const docTitles = docs.map((d) => d.title);
            expect(docTitles).toContain("Doc 1");
            expect(docTitles).toContain("Doc 2");
            expect(docs[0].projectId).toBe(newProjectId);

            const boards = await boardsService.getAllProjectBoards(testUserId, newProjectId);
            expect(boards).toHaveLength(2);
            const boardTitles = boards.map((b) => b.title);
            expect(boardTitles).toContain("Board 1");
            expect(boardTitles).toContain("Board 2");

            const board1 = boards.find((b) => b.title === "Board 1")!;
            const board2 = boards.find((b) => b.title === "Board 2")!;

            const sectionsB1 = await boardSectionsService.getBoardSectionsWithItems(testUserId, board1.id);
            const sectionsB2 = await boardSectionsService.getBoardSectionsWithItems(testUserId, board2.id);
            expect(sectionsB1).toHaveLength(2);
            expect(sectionsB2).toHaveLength(1);

            expect(sectionsB1[0].title).toBe("Section 1");
            expect(sectionsB1[0].parentId).toBe(board1.id);
            expect(sectionsB1[0].position).toBe(0);
            expect(sectionsB1[1].title).toBe("Section 2");
            expect(sectionsB1[1].parentId).toBe(board1.id);
            expect(sectionsB1[1].position).toBe(1);
            expect(sectionsB2[0].title).toBe("Section 3");
            expect(sectionsB2[0].parentId).toBe(board2.id);
            expect(sectionsB2[0].position).toBe(0);

            const section1 = sectionsB1[0];
            const section2 = sectionsB1[1];
            const section3 = sectionsB2[0];

            expect(section1.items).toHaveLength(1);
            expect(section1.items[0].title).toBe("Item 1");
            expect(section1.items[0].parentId).toBe(section1.id);
            expect(section1.items[0].position).toBe(0);
            expect(section1.items[0].description).toBe("First item");
            expect(section1.items[0].isDone).toBe(false);

            expect(section2.items).toHaveLength(1);
            expect(section2.items[0].title).toBe("Item 2");
            expect(section2.items[0].parentId).toBe(section2.id);
            expect(section2.items[0].position).toBe(0);
            expect(section2.items[0].isDone).toBe(true);

            expect(section3.items).toHaveLength(1);
            expect(section3.items[0].title).toBe("Item 3");
            expect(section3.items[0].parentId).toBe(section3.id);
            expect(section3.items[0].position).toBe(0);

            const check1 = await boardCheckItemsService.getBoardItemCheckItems(testUserId, section1.items[0].id);
            const check2 = await boardCheckItemsService.getBoardItemCheckItems(testUserId, section2.items[0].id);
            const check3 = await boardCheckItemsService.getBoardItemCheckItems(testUserId, section3.items[0].id);

            expect(check1).toHaveLength(2);
            expect(check1[0].title).toBe("Check 1");
            expect(check1[0].parentId).toBe(section1.items[0].id);
            expect(check1[0].position).toBe(0);
            expect(check1[0].isDone).toBe(false);
            expect(check1[1].title).toBe("Check 2");
            expect(check1[1].parentId).toBe(section1.items[0].id);
            expect(check1[1].position).toBe(1);
            expect(check1[1].isDone).toBe(true);

            expect(check2).toHaveLength(1);
            expect(check2[0].title).toBe("Check 3");
            expect(check2[0].parentId).toBe(section2.items[0].id);
            expect(check2[0].position).toBe(0);

            expect(check3).toHaveLength(0);
        });

        it("should return the old-to-new project ID mapping", async () => {
            const oldProjectId = crypto.randomUUID();

            const projectData: ExportedProject = {
                id: oldProjectId,
                title: "Mapping Test",
                description: null,
                documents: [],
                boards: [],
                boardSections: [],
                boardItems: [],
                boardCheckItems: [],
            };

            const mapping = await importService.importProjects(testUserId, [projectData]);

            expect(mapping).toHaveLength(1);
            expect(mapping[0].old).toBe(oldProjectId);
            expect(mapping[0].new).toBeDefined();
            expect(typeof mapping[0].new).toBe("string");

            const project = await projectsService.getProject(testUserId, mapping[0].new);
            expect(project).toBeDefined();
            expect(project!.id).toBe(mapping[0].new);
        });

        it("should import multiple projects", async () => {
            const oldId1 = crypto.randomUUID();
            const oldId2 = crypto.randomUUID();

            const project1: ExportedProject = {
                id: oldId1, title: "Project A", description: null,
                documents: [], boards: [], boardSections: [], boardItems: [], boardCheckItems: [],
            };
            const project2: ExportedProject = {
                id: oldId2, title: "Project B", description: "Second",
                documents: [], boards: [], boardSections: [], boardItems: [], boardCheckItems: [],
            };

            const mapping = await importService.importProjects(testUserId, [project1, project2]);

            expect(mapping).toHaveLength(2);

            const allProjects = await projectsService.getAllProjects(testUserId);
            expect(allProjects).toHaveLength(2);
            const titles = allProjects.map((p) => p.title);
            expect(titles).toContain("Project A");
            expect(titles).toContain("Project B");
        });

        it("should remap parentId chains correctly", async () => {
            const oldProjectId = crypto.randomUUID();
            const oldBoardId = crypto.randomUUID();
            const oldSectionId = crypto.randomUUID();
            const oldItemId = crypto.randomUUID();
            const oldCheckId = crypto.randomUUID();

            const projectData: ExportedProject = {
                id: oldProjectId,
                title: "Chain Test",
                description: null,
                documents: [],
                boards: [{ id: oldBoardId, projectId: oldProjectId, title: "Board" }],
                boardSections: [{ id: oldSectionId, parentId: oldBoardId, title: "Section", position: 0 }],
                boardItems: [{ id: oldItemId, parentId: oldSectionId, title: "Item", position: 0, isDone: false, description: null }],
                boardCheckItems: [{ id: oldCheckId, parentId: oldItemId, title: "Check", position: 0, isDone: false }],
            };

            const mapping = await importService.importProjects(testUserId, [projectData]);
            const newProjectId = mapping[0].new;

            const boards = await boardsService.getAllProjectBoards(testUserId, newProjectId);
            expect(boards).toHaveLength(1);
            expect(boards[0].projectId).toBe(newProjectId);
            const newBoardId = boards[0].id;

            const sections = await boardSectionsService.getBoardSectionsWithItems(testUserId, newBoardId);
            expect(sections).toHaveLength(1);
            expect(sections[0].parentId).toBe(newBoardId);
            const newSectionId = sections[0].id;

            expect(sections[0].items).toHaveLength(1);
            expect(sections[0].items[0].parentId).toBe(newSectionId);
            const newItemId = sections[0].items[0].id;

            const checkItems = await boardCheckItemsService.getBoardItemCheckItems(testUserId, newItemId);
            expect(checkItems).toHaveLength(1);
            expect(checkItems[0].parentId).toBe(newItemId);
        });

        it("should import a bare project with no child entities", async () => {
            const projectData: ExportedProject = {
                id: crypto.randomUUID(),
                title: "Empty Project",
                description: null,
                documents: [],
                boards: [],
                boardSections: [],
                boardItems: [],
                boardCheckItems: [],
            };

            const mapping = await importService.importProjects(testUserId, [projectData]);
            const newProjectId = mapping[0].new;

            const project = await projectsService.getProject(testUserId, newProjectId);
            expect(project).toBeDefined();
            expect(project!.title).toBe("Empty Project");

            const docs = await documentsService.getAllProjectDocuments(testUserId, newProjectId);
            expect(docs).toHaveLength(0);

            const boards = await boardsService.getAllProjectBoards(testUserId, newProjectId);
            expect(boards).toHaveLength(0);
        });

        it("should import a project with only documents", async () => {
            const oldProjectId = crypto.randomUUID();

            const projectData: ExportedProject = {
                id: oldProjectId,
                title: "Docs Only",
                description: null,
                documents: [
                    { id: crypto.randomUUID(), projectId: oldProjectId, title: "Only Doc", content: "Some content" },
                ],
                boards: [],
                boardSections: [],
                boardItems: [],
                boardCheckItems: [],
            };

            const mapping = await importService.importProjects(testUserId, [projectData]);
            const newProjectId = mapping[0].new;

            const docs = await documentsService.getAllProjectDocuments(testUserId, newProjectId);
            expect(docs).toHaveLength(1);
            expect(docs[0].title).toBe("Only Doc");
            expect(docs[0].content).toBe("Some content");
            expect(docs[0].projectId).toBe(newProjectId);

            const boards = await boardsService.getAllProjectBoards(testUserId, newProjectId);
            expect(boards).toHaveLength(0);
        });

        it("should import a project with only boards", async () => {
            const oldProjectId = crypto.randomUUID();
            const oldBoardId = crypto.randomUUID();

            const projectData: ExportedProject = {
                id: oldProjectId,
                title: "Boards Only",
                description: null,
                documents: [],
                boards: [{ id: oldBoardId, projectId: oldProjectId, title: "Lone Board" }],
                boardSections: [],
                boardItems: [],
                boardCheckItems: [],
            };

            const mapping = await importService.importProjects(testUserId, [projectData]);
            const newProjectId = mapping[0].new;

            const docs = await documentsService.getAllProjectDocuments(testUserId, newProjectId);
            expect(docs).toHaveLength(0);

            const boards = await boardsService.getAllProjectBoards(testUserId, newProjectId);
            expect(boards).toHaveLength(1);
            expect(boards[0].title).toBe("Lone Board");
            expect(boards[0].projectId).toBe(newProjectId);
        });

        it("should scope imported data to the importing user", async () => {
            const otherUser = await createTestUser();

            const projectData: ExportedProject = {
                id: crypto.randomUUID(),
                title: "Private Project",
                description: null,
                documents: [
                    { id: crypto.randomUUID(), projectId: crypto.randomUUID(), title: "Private Doc", content: "" },
                ],
                boards: [],
                boardSections: [],
                boardItems: [],
                boardCheckItems: [],
            };

            await importService.importProjects(testUserId, [projectData]);

            const otherProjects = await projectsService.getAllProjects(otherUser.id);
            expect(otherProjects).toHaveLength(0);

            const myProjects = await projectsService.getAllProjects(testUserId);
            expect(myProjects).toHaveLength(1);
            expect(myProjects[0].userId).toBe(testUserId);
        });

        it("should preserve item isDone and description fields", async () => {
            const oldProjectId = crypto.randomUUID();
            const oldBoardId = crypto.randomUUID();
            const oldSectionId = crypto.randomUUID();

            const projectData: ExportedProject = {
                id: oldProjectId,
                title: "Fields Test",
                description: null,
                documents: [],
                boards: [{ id: oldBoardId, projectId: oldProjectId, title: "Board" }],
                boardSections: [{ id: oldSectionId, parentId: oldBoardId, title: "Section", position: 0 }],
                boardItems: [
                    { id: crypto.randomUUID(), parentId: oldSectionId, title: "Done Item", position: 0, isDone: true, description: "Already done" },
                    { id: crypto.randomUUID(), parentId: oldSectionId, title: "Pending Item", position: 1, isDone: false, description: null },
                ],
                boardCheckItems: [],
            };

            const mapping = await importService.importProjects(testUserId, [projectData]);
            const boards = await boardsService.getAllProjectBoards(testUserId, mapping[0].new);
            const sections = await boardSectionsService.getBoardSectionsWithItems(testUserId, boards[0].id);

            expect(sections).toHaveLength(1);
            expect(sections[0].items).toHaveLength(2);

            const doneItem = sections[0].items.find((i) => i.title === "Done Item")!;
            expect(doneItem.isDone).toBe(true);
            expect(doneItem.description).toBe("Already done");

            const pendingItem = sections[0].items.find((i) => i.title === "Pending Item")!;
            expect(pendingItem.isDone).toBe(false);
            expect(pendingItem.description).toBeNull();
        });

        it("should preserve section and item position ordering", async () => {
            const oldProjectId = crypto.randomUUID();
            const oldBoardId = crypto.randomUUID();

            const projectData: ExportedProject = {
                id: oldProjectId,
                title: "Order Test",
                description: null,
                documents: [],
                boards: [{ id: oldBoardId, projectId: oldProjectId, title: "Board" }],
                boardSections: [
                    { id: crypto.randomUUID(), parentId: oldBoardId, title: "Second", position: 1 },
                    { id: crypto.randomUUID(), parentId: oldBoardId, title: "First", position: 0 },
                    { id: crypto.randomUUID(), parentId: oldBoardId, title: "Third", position: 2 },
                ],
                boardItems: [],
                boardCheckItems: [],
            };

            const mapping = await importService.importProjects(testUserId, [projectData]);
            const boards = await boardsService.getAllProjectBoards(testUserId, mapping[0].new);
            const sections = await boardSectionsService.getBoardSections(testUserId, boards[0].id);

            expect(sections).toHaveLength(3);
            expect(sections[0].title).toBe("First");
            expect(sections[1].title).toBe("Second");
            expect(sections[2].title).toBe("Third");
        });
    });
});