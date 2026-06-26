import { describe, it, expect, beforeEach } from "vitest";
import * as documentsService from "@/app/services/documents";
import { createTestUser } from "../fixtures/users";
import { createTestProject } from "../fixtures/projects";
import { createTestDocument } from "../fixtures/documents";

describe("Documents Service Integration Tests", () => {
    let testUserId: string;
    let testProjectId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        testUserId = user.id;
        testProjectId = await createTestProject(testUserId, "Test Project");
    });

    describe("createDocument", () => {
        it("should create a document with valid data", async () => {
            const documentId = await documentsService.createDocument(
                "My Document",
                testUserId,
                testProjectId);

            expect(documentId).toBeDefined();
            expect(typeof documentId).toBe("string");

            const document = await documentsService.getDocument(testUserId, documentId);
            expect(document).toBeDefined();
            expect(document?.title).toBe("My Document");
            expect(document?.userId).toBe(testUserId);
            expect(document?.projectId).toBe(testProjectId);
            expect(document?.content).toBe("");
        });

        it("should create multiple documents in same project", async () => {
            const id1 = await documentsService.createDocument("Doc 1", testUserId, testProjectId);
            const id2 = await documentsService.createDocument("Doc 2", testUserId, testProjectId);

            expect(id1).not.toBe(id2);

            const docs = await documentsService.getAllProjectDocuments(testUserId, testProjectId);
            expect(docs.length).toBeGreaterThanOrEqual(2);
        });

        it("should set timestamps on creation", async () => {
            const before = Date.now();
            const documentId = await documentsService.createDocument(
                "Timestamped Doc",
                testUserId,
                testProjectId);
            const after = Date.now();

            const document = await documentsService.getDocument(testUserId, documentId);

            expect(document?.createdAt).toBeGreaterThanOrEqual(before);
            expect(document?.createdAt).toBeLessThanOrEqual(after);
            expect(document?.updatedAt).toBe(document?.createdAt);
        });
    });

    describe("getDocument", () => {
        it("should retrieve an existing document", async () => {
            const documentId = await createTestDocument(
                testUserId,
                testProjectId,
                "Fetch Test");

            const retrieved = await documentsService.getDocument(testUserId, documentId);

            expect(retrieved).toBeDefined();
            expect(retrieved?.id).toBe(documentId);
            expect(retrieved?.title).toBe("Fetch Test");
        });

        it("should return undefined for non-existent document", async () => {
            const retrieved = await documentsService.getDocument(
                testUserId,
                crypto.randomUUID());
            expect(retrieved).toBeUndefined();
        });

        it("should not allow fetching other user's document", async () => {
            const otherUser = await createTestUser();
            const documentId = await createTestDocument(
                testUserId,
                testProjectId,
                "Private Doc");

            const retrieved = await documentsService.getDocument(otherUser.id, documentId);
            expect(retrieved).toBeUndefined();
        });

        it("should update lastRequestedAt when fetching", async () => {
            const documentId = await createTestDocument(testUserId, testProjectId);

            const first = await documentsService.getDocument(testUserId, documentId);
            expect(first).toBeDefined();

            await new Promise((resolve) => setTimeout(resolve, 10));

            const second = await documentsService.getDocument(testUserId, documentId);

            expect(second?.lastRequestedAt).toBeGreaterThan(
                first?.lastRequestedAt || 0);
        });
    });

    describe("getAllProjectDocuments", () => {
        it("should return empty array for non-existent project", async () => {
            const docs = await documentsService.getAllProjectDocuments(
                testUserId,
                crypto.randomUUID());
            expect(docs).toHaveLength(0);
        });

        it("should retrieve all documents for a project", async () => {
            await createTestDocument(testUserId, testProjectId, "Doc 1");
            await createTestDocument(testUserId, testProjectId, "Doc 2");
            await createTestDocument(testUserId, testProjectId, "Doc 3");

            const docs = await documentsService.getAllProjectDocuments(
                testUserId,
                testProjectId);

            expect(docs.length).toBeGreaterThanOrEqual(3);
            const titles = docs.map((d) => d.title);
            expect(titles).toContain("Doc 1");
            expect(titles).toContain("Doc 2");
            expect(titles).toContain("Doc 3");
        });

        it("should return empty array for project with no documents", async () => {
            const newProject = await createTestProject(testUserId, "Empty Project");
            const docs = await documentsService.getAllProjectDocuments(
                testUserId,
                newProject);
            expect(docs).toHaveLength(0);
        });

        it("should only return documents for specified project", async () => {
            const project2 = await createTestProject(testUserId, "Project 2");

            const doc1Id = await createTestDocument(
                testUserId,
                testProjectId,
                "Project1 Doc");

            const doc2Id = await createTestDocument(
                testUserId,
                project2,
                "Project2 Doc");

            const project1Docs = await documentsService.getAllProjectDocuments(
                testUserId,
                testProjectId);

            const project2Docs = await documentsService.getAllProjectDocuments(
                testUserId,
                project2);

            expect(project1Docs).toHaveLength(1);
            expect(project1Docs[0].id).toBe(doc1Id);
            expect(project2Docs).toHaveLength(1);
            expect(project2Docs[0].id).toBe(doc2Id);
        });

        it("should not return documents from other users", async () => {
            const otherUser = await createTestUser();
            const otherProjectId = await createTestProject(otherUser.id, "Other Project");

            await createTestDocument(testUserId, testProjectId, "My Doc");
            await createTestDocument(otherUser.id, otherProjectId, "Other Doc");

            const myDocs = await documentsService.getAllProjectDocuments(
                testUserId,
                testProjectId);
            expect(myDocs).toHaveLength(1);
            expect(myDocs[0].title).toBe("My Doc");
        });
    });

    describe("getRecentDocuments", () => {
        it("should return at most 6 documents", async () => {
            for (let i = 0; i < 3; i++) {
                const projectId = await createTestProject(testUserId, `Project ${i}`);
                for (let j = 0; j < 3; j++) {
                    await createTestDocument(
                        testUserId,
                        projectId,
                        `Doc ${i}-${j}`);
                }
            }

            const recent = await documentsService.getRecentDocuments(testUserId);
            expect(recent.length).toBeLessThanOrEqual(6);
        });

        it("should return most recently used documents first", async () => {
            const ids: string[] = [];
            for (let i = 0; i < 3; i++) {
                const id = await createTestDocument(
                    testUserId,
                    testProjectId,
                    `Doc ${i}`);
                ids.push(id);
                await new Promise((resolve) => setTimeout(resolve, 10));
            }

            await documentsService.getDocument(testUserId, ids[0]);

            const recent = await documentsService.getRecentDocuments(testUserId);
            expect(recent[0].id).toBe(ids[0]);
        });

        it("should include project title in results", async () => {
            const documentId = await createTestDocument(
                testUserId,
                testProjectId,
                "Test Doc");

            const recent = await documentsService.getRecentDocuments(testUserId);
            const found = recent.find((d) => d.id === documentId);

            expect(found).toBeDefined();
            expect(found?.project).toBeDefined();
            expect(found?.project?.title).toBe("Test Project");
        });

        it("should only return documents for specific user", async () => {
            const otherUser = await createTestUser();
            const otherProject = await createTestProject(otherUser.id, "Other");

            await createTestDocument(testUserId, testProjectId, "My Doc");
            await createTestDocument(otherUser.id, otherProject, "Other Doc");

            const myRecent = await documentsService.getRecentDocuments(testUserId);
            const otherRecent = await documentsService.getRecentDocuments(otherUser.id);

            expect(myRecent.length).toBe(1);
            expect(myRecent[0].title).toBe("My Doc");
            expect(otherRecent.length).toBe(1);
            expect(otherRecent[0].title).toBe("Other Doc");
        });

        it("should return empty array for user with no documents", async () => {
            const newUser = await createTestUser();
            const recent = await documentsService.getRecentDocuments(newUser.id);
            expect(recent).toHaveLength(0);
        });
    });

    describe("updateDocument", () => {
        it("should update document title", async () => {
            const documentId = await createTestDocument(
                testUserId,
                testProjectId,
                "Original Title");

            const updated = await documentsService.updateDocument(testUserId, documentId, {
                title: "Updated Title",
            });

            expect(updated?.title).toBe("Updated Title");

            const retrieved = await documentsService.getDocument(testUserId, documentId);
            expect(retrieved?.title).toBe("Updated Title");
        });

        it("should update document content", async () => {
            const documentId = await createTestDocument(testUserId, testProjectId, "Test");

            const updated = await documentsService.updateDocument(testUserId, documentId, {
                content: "New content",
            });

            expect(updated?.content).toBe("New content");
        });

        it("should update both title and content", async () => {
            const documentId = await createTestDocument(testUserId, testProjectId, "Test");

            const updated = await documentsService.updateDocument(testUserId, documentId, {
                title: "New Title",
                content: "New Content",
            });

            expect(updated?.title).toBe("New Title");
            expect(updated?.content).toBe("New Content");
        });

        it("should throw when updating non-existent document", async () => {
            await expect(
                documentsService.updateDocument(testUserId, crypto.randomUUID(), {
                    title: "New Title",
                })
            ).rejects.toThrow();
        });

        it("should not allow updating other user's document", async () => {
            const otherUser = await createTestUser();
            const documentId = await createTestDocument(
                testUserId,
                testProjectId,
                "Original");

            await expect(
                documentsService.updateDocument(otherUser.id, documentId, {
                    title: "Hacked",
                })
            ).rejects.toThrow();

            const original = await documentsService.getDocument(testUserId, documentId);
            expect(original?.title).toBe("Original");
        });

        it("should update updatedAt timestamp", async () => {
            const documentId = await createTestDocument(testUserId, testProjectId, "Test");

            const before = await documentsService.getDocument(testUserId, documentId);
            await new Promise((resolve) => setTimeout(resolve, 10));

            const after = await documentsService.updateDocument(testUserId, documentId, {
                title: "Updated",
            });

            expect(after?.updatedAt).toBeGreaterThan(before?.updatedAt || 0);
        });
    });

    describe("deleteDocument", () => {
        it("should delete an existing document", async () => {
            const documentId = await createTestDocument(
                testUserId,
                testProjectId,
                "To Delete");

            await documentsService.deleteDocument(testUserId, documentId);

            const retrieved = await documentsService.getDocument(testUserId, documentId);
            expect(retrieved).toBeUndefined();
        });

        it("should throw when deleting non-existent document", async () => {
            await expect(
                documentsService.deleteDocument(testUserId, crypto.randomUUID())
            ).rejects.toThrow();
        });

        it("should not allow deleting other user's document", async () => {
            const otherUser = await createTestUser();
            const documentId = await createTestDocument(testUserId, testProjectId, "Test");

            await expect(
                documentsService.deleteDocument(otherUser.id, documentId)
            ).rejects.toThrow();

            const retrieved = await documentsService.getDocument(testUserId, documentId);
            expect(retrieved).toBeDefined();
        });
    });

    describe("Authorization", () => {
        it("should enforce user isolation across operations", async () => {
            const user1 = await createTestUser();
            const user2 = await createTestUser();

            const project1 = await createTestProject(user1.id, "Project 1");
            const project2 = await createTestProject(user2.id, "Project 2");

            const doc1Id = await createTestDocument(user1.id, project1, "User 1 Doc");
            const doc2Id = await createTestDocument(user2.id, project2, "User 2 Doc");

            const user1Docs = await documentsService.getAllProjectDocuments(
                user1.id,
                project1);

            const user2Docs = await documentsService.getAllProjectDocuments(
                user2.id,
                project2);

            expect(user1Docs).toHaveLength(1);
            expect(user2Docs).toHaveLength(1);
            expect(user1Docs[0].id).toBe(doc1Id);
            expect(user2Docs[0].id).toBe(doc2Id);
        });
    });
});