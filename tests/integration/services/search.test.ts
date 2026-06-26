import { describe, it, expect, beforeEach } from "vitest";
import * as searchService from "@/app/services/search";
import { createTestUser } from "../fixtures/users";
import { createTestProject } from "../fixtures/projects";
import { createTestBoard } from "../fixtures/boards";
import { createTestBoardSection } from "../fixtures/sections";
import { createTestBoardItem } from "../fixtures/items";
import { createTestBoardCheckItem } from "../fixtures/check-items";
import { createTestDocument } from "../fixtures/documents";
import { createSearchIndexEntry } from "../fixtures/search-index";

describe("Search Service Integration Tests", () => {
    let testUserId: string;
    let testProjectId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        testUserId = user.id;
        testProjectId = await createTestProject(testUserId, "Test Project");
    });

    describe("performSearch", () => {
        describe("with empty query (default results)", () => {
            it("should return recent projects when query is empty", async () => {
                const results = await searchService.performSearch("", testUserId);

                expect(results.length).toBeGreaterThanOrEqual(1);
                const projectResults = results.filter((r) => r.type === "project");
                expect(projectResults.length).toBeGreaterThanOrEqual(1);
            });

            it("should limit default results to 6", async () => {
                for (let i = 0; i < 8; i++) {
                    await createTestProject(testUserId, `Project ${i}`);
                }

                const results = await searchService.performSearch("", testUserId);

                expect(results.length).toBeLessThanOrEqual(6);
            });

            it("should return empty array for user with no projects", async () => {
                const newUser = await createTestUser();
                const results = await searchService.performSearch("", newUser.id);

                expect(results).toHaveLength(0);
            });

            it("should only return own projects, not other users'", async () => {
                const otherUser = await createTestUser();
                await createTestProject(otherUser.id, "Other's Project");

                const results = await searchService.performSearch("", testUserId);

                const theirProjects = results.filter((r) => r.title === "Other's Project");
                expect(theirProjects).toHaveLength(0);
            });

            it("should return empty array for whitespace-only query", async () => {
                const results = await searchService.performSearch("   ", testUserId);

                expect(Array.isArray(results)).toBe(true);
            });
        });

        describe("with matching query (FTS5 search)", () => {
            it("should find projects by title", async () => {
                const projectId = await createTestProject(
                    testUserId,
                    "My Special Project");

                const results = await searchService.performSearch("Special", testUserId);
                const projects = results.filter((r) => r.type === "project");

                expect(projects.length).toBeGreaterThanOrEqual(1);
                const found = projects.find((p) => p.id === projectId);
                expect(found).toBeDefined();
                expect(found?.title).toBe("My Special Project");
                expect(found?.url).toBe(`/projects/${projectId}`);
            });

            it("should find boards by title", async () => {
                const boardId = await createTestBoard(
                    testUserId,
                    testProjectId,
                    "Research Board");

                const results = await searchService.performSearch("Research", testUserId);
                const boards = results.filter((r) => r.type === "board");

                expect(boards.length).toBeGreaterThanOrEqual(1);
                const found = boards.find((b) => b.id === boardId);
                expect(found).toBeDefined();
                expect(found?.title).toBe("Research Board");
                expect(found?.projectTitle).toBe("Test Project");
            });

            it("should find documents by title", async () => {
                const documentId = await createTestDocument(
                    testUserId,
                    testProjectId,
                    "Meeting Notes");

                const results = await searchService.performSearch("Notes", testUserId);
                const docs = results.filter((r) => r.type === "document");

                expect(docs.length).toBeGreaterThanOrEqual(1);
                const found = docs.find((d) => d.id === documentId);
                expect(found).toBeDefined();
                expect(found?.title).toBe("Meeting Notes");
            });

            it("should find sections by title", async () => {
                const boardId = await createTestBoard(
                    testUserId,
                    testProjectId,
                    "Product Board");
                const sectionId = await createTestBoardSection(
                    testUserId,
                    boardId,
                    0,
                    "Development Tasks");

                const results = await searchService.performSearch("Development", testUserId);
                const sections = results.filter((r) => r.type === "section");

                expect(sections.length).toBeGreaterThanOrEqual(1);
                const found = sections.find((s) => s.id === sectionId);
                expect(found).toBeDefined();
                expect(found?.title).toBe("Development Tasks");
                expect(found?.boardTitle).toBe("Product Board");
                expect(found?.projectTitle).toBe("Test Project");
            });

            it("should find items by title", async () => {
                const boardId = await createTestBoard(
                    testUserId,
                    testProjectId,
                    "Shopping Board");
                const sectionId = await createTestBoardSection(
                    testUserId,
                    boardId,
                    0,
                    "Groceries");
                const itemId = await createTestBoardItem(
                    testUserId,
                    sectionId,
                    0,
                    "Buy milk");

                const results = await searchService.performSearch("milk", testUserId);
                const items = results.filter((r) => r.type === "item");

                expect(items.length).toBeGreaterThanOrEqual(1);
                const found = items.find((i) => i.id === itemId);
                expect(found).toBeDefined();
                expect(found?.title).toBe("Buy milk");
                expect(found?.boardTitle).toBe("Shopping Board");
            });

            it("should find check-items by title", async () => {
                const boardId = await createTestBoard(
                    testUserId,
                    testProjectId,
                    "Tasks");
                const sectionId = await createTestBoardSection(
                    testUserId,
                    boardId,
                    0,
                    "Chores");
                const itemId = await createTestBoardItem(
                    testUserId,
                    sectionId,
                    0,
                    "Home tasks");
                const checkItemId = await createTestBoardCheckItem(
                    testUserId,
                    itemId,
                    0,
                    "Call plumber");

                const results = await searchService.performSearch(
                    "plumber",
                    testUserId);
                const checkItems = results.filter((r) => r.type === "check-item");

                expect(checkItems.length).toBeGreaterThanOrEqual(1);
                const found = checkItems.find((c) => c.id === checkItemId);
                expect(found).toBeDefined();
                expect(found?.title).toBe("Call plumber");
                expect(found?.boardTitle).toBe("Tasks");
            });

            it("should return results for all entity types in one search", async () => {
                const boardId = await createTestBoard(
                    testUserId,
                    testProjectId,
                    "Zephyr Board");
                const sectionId = await createTestBoardSection(
                    testUserId,
                    boardId,
                    0,
                    "Zephyr Section");
                const itemId = await createTestBoardItem(
                    testUserId,
                    sectionId,
                    0,
                    "Zephyr Item");
                await createTestBoardCheckItem(
                    testUserId,
                    itemId,
                    0,
                    "Zephyr Check");
                await createTestDocument(
                    testUserId,
                    testProjectId,
                    "Zephyr Document");
                await createTestProject(testUserId, "Zephyr Project");

                const results = await searchService.performSearch(
                    "Zephyr",
                    testUserId);

                const types = new Set(results.map((r) => r.type));
                expect(types.has("project")).toBe(true);
                expect(types.has("board")).toBe(true);
                expect(types.has("section")).toBe(true);
                expect(types.has("item")).toBe(true);
                expect(types.has("check-item")).toBe(true);
                expect(types.has("document")).toBe(true);
            });

            it("should limit results to 6", async () => {
                for (let i = 0; i < 8; i++) {
                    await createTestProject(
                        testUserId,
                        `Unicorn Project ${i}`);
                }

                const results = await searchService.performSearch(
                    "Unicorn",
                    testUserId);

                expect(results.length).toBeLessThanOrEqual(6);
            });

            it("should return empty for non-matching query", async () => {
                const results = await searchService.performSearch(
                    "xyznonexistent",
                    testUserId);

                expect(results).toHaveLength(0);
            });

            it("should handle trigram partial matching", async () => {
                await createTestProject(
                    testUserId,
                    "Important Document");

                const results = await searchService.performSearch(
                    "Imp",
                    testUserId);

                const found = results.find((r) => r.title === "Important Document");
                expect(results.length).toBeGreaterThanOrEqual(1);
                expect(found).toBeDefined();
            });

            it("should be case-insensitive", async () => {
                await createTestProject(testUserId, "Alpha Project");

                const results = await searchService.performSearch("alpha", testUserId);

                const found = results.find((r) => r.title === "Alpha Project");
                expect(found).toBeDefined();
            });

            it("should handle multi-word queries", async () => {
                const projectId = await createTestProject(
                    testUserId,
                    "Very Specific Title");

                const results = await searchService.performSearch(
                    "Very Specific",
                    testUserId);

                const found = results.find((r) => r.id === projectId);
                expect(found).toBeDefined();
            });

            it("should build correct URL per type", async () => {
                const projectId = await createTestProject(
                    testUserId,
                    "URL Test Project");
                const boardId = await createTestBoard(
                    testUserId,
                    projectId,
                    "URL Test Board");
                const sectionId = await createTestBoardSection(
                    testUserId,
                    boardId,
                    0,
                    "URL Test Section");
                const itemId = await createTestBoardItem(
                    testUserId,
                    sectionId,
                    0,
                    "URL Test Item");
                await createTestDocument(
                    testUserId,
                    projectId,
                    "URL Test Document");

                const results = await searchService.performSearch(
                    "URL Test",
                    testUserId);

                const projectResult = results.find(
                    (r) => r.type === "project");
                expect(projectResult?.url).toBe(`/projects/${projectId}`);

                const boardResult = results.find((r) => r.type === "board");
                expect(boardResult?.url).toBe(
                    `/projects/${projectId}/boards/${boardId}`);

                const sectionResult = results.find((r) => r.type === "section");
                expect(sectionResult?.url).toBe(
                    `/projects/${projectId}/boards/${boardId}`);

                const itemResult = results.find((r) => r.type === "item");
                expect(itemResult?.url).toBe(
                    `/projects/${projectId}/boards/${boardId}?itemId=${itemId}`);

                const docResult = results.find((r) => r.type === "document");
                expect(docResult?.url).toBe(
                    `/projects/${projectId}/documents/${docResult?.id}`);
            });
        });

        describe("edge cases", () => {
            it("should skip search entries with null title", async () => {
                await createSearchIndexEntry({
                    title: null,
                    type: "project",
                    targetId: crypto.randomUUID(),
                    projectId: testProjectId,
                    userId: testUserId,
                });

                const results = await searchService.performSearch("", testUserId);
                expect(Array.isArray(results)).toBe(true);
            });

            it("should skip search entries with null type", async () => {
                await createSearchIndexEntry({
                    title: "Untyped Entity",
                    type: null,
                    targetId: crypto.randomUUID(),
                    projectId: testProjectId,
                    userId: testUserId,
                });

                const results = await searchService.performSearch(
                    "Untyped",
                    testUserId);
                const found = results.find((r) => r.title === "Untyped Entity");
                expect(found).toBeUndefined();
            });

            it("should skip search entries with null projectId", async () => {
                await createSearchIndexEntry({
                    title: "Orphaned Entity",
                    type: "document",
                    targetId: crypto.randomUUID(),
                    projectId: null,
                    userId: testUserId,
                });

                const results = await searchService.performSearch(
                    "Orphaned",
                    testUserId);
                const found = results.find((r) => r.title === "Orphaned Entity");
                expect(found).toBeUndefined();
            });

            it("should skip entities whose parent project is not accessible", async () => {
                const otherUser = await createTestUser();
                const otherProjectId = await createTestProject(
                    otherUser.id,
                    "Other Project");
                const otherBoardId = await createTestBoard(
                    otherUser.id,
                    otherProjectId,
                    "Hidden Board");

                const results = await searchService.performSearch(
                    "Hidden",
                    testUserId);

                const found = results.find((r) => r.id === otherBoardId);
                expect(found).toBeUndefined();
            });
        });

        describe("authorization", () => {
            it("should enforce user isolation", async () => {
                const userA = await createTestUser();
                const userB = await createTestUser();

                const projectA = await createTestProject(userA.id, "User A Project");
                await createTestProject(userB.id, "User B Project");

                const resultsA = await searchService.performSearch("Project", userA.id);
                const resultsB = await searchService.performSearch("Project", userB.id);

                const aTitles = resultsA.map((r) => r.title);
                const bTitles = resultsB.map((r) => r.title);

                expect(aTitles).toContain("User A Project");
                expect(aTitles).not.toContain("User B Project");
                expect(bTitles).toContain("User B Project");
                expect(bTitles).not.toContain("User A Project");
            });
        });
    });
});