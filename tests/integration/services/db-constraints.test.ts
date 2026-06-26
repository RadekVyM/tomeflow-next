import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/db";
import { users, projectBoardItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createTestUser } from "../fixtures/users";
import { createTestProject } from "../fixtures/projects";
import { createTestBoard } from "../fixtures/boards";
import { createTestBoardSection } from "../fixtures/sections";

describe("DB Constraint Integration Tests", () => {
    let testUserId: string;
    let testProjectId: string;
    let testBoardId: string;
    let testSectionId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        testUserId = user.id;
        testProjectId = await createTestProject(testUserId, "Test Project");
        testBoardId = await createTestBoard(testUserId, testProjectId);
        testSectionId = await createTestBoardSection(testUserId, testBoardId, 0, "Test Section");
    });

    describe("unique constraint on users.email", () => {
        it("should prevent creating two users with the same email", async () => {
            const email = `duplicate-${crypto.randomUUID()}@example.com`;

            await db.insert(users).values({
                id: `user-${crypto.randomUUID()}`,
                name: "First",
                email: email,
                emailVerified: null,
                image: null,
            });

            await expect(
                db.insert(users).values({
                    id: `user-${crypto.randomUUID()}`,
                    name: "Second",
                    email: email,
                    emailVerified: null,
                    image: null,
                })
            ).rejects.toThrow();
        });
    });

    describe("default isDone value on board items", () => {
        it("should default to false when creating an item without isDone", async () => {
            const itemId = `item-${crypto.randomUUID()}`;
            const now = Date.now();

            await db.insert(projectBoardItems).values({
                id: itemId,
                userId: testUserId,
                parentId: testSectionId,
                title: "Default Test",
                position: 0,
                createdAt: now,
                updatedAt: now,
                lastRequestedAt: now,
            });

            const item = await db.query.projectBoardItems.findFirst({
                where: eq(projectBoardItems.id, itemId),
            });

            expect(item).toBeDefined();
            expect(item!.isDone).toBe(false);
        });
    });
});