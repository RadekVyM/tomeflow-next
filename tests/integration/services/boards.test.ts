import { describe, it, expect, beforeEach } from "vitest";
import * as boardsService from "@/app/services/boards";
import { createTestUser } from "../fixtures/users";
import { createTestProject } from "../fixtures/projects";
import { createTestBoard } from "../fixtures/boards";

describe("Boards Service Integration Tests", () => {
	let testUserId: string;
	let testProjectId: string;

	beforeEach(async () => {
		const user = await createTestUser();
		testUserId = user.id;
		testProjectId = await createTestProject(testUserId, "Test Project");
	});

	describe("createBoard", () => {
		it("should create a board within a project", async () => {
			const boardId = await boardsService.createBoard(
				"My Board",
				testUserId,
				testProjectId);

			expect(boardId).toBeDefined();
			expect(typeof boardId).toBe("string");

			const board = await boardsService.getBoard(testUserId, boardId);
			expect(board).toBeDefined();
			expect(board?.title).toBe("My Board");
			expect(board?.projectId).toBe(testProjectId);
			expect(board?.userId).toBe(testUserId);
		});

		it("should create multiple boards in same project", async () => {
			const id1 = await boardsService.createBoard(
				"Board 1",
				testUserId,
				testProjectId);
			const id2 = await boardsService.createBoard(
				"Board 2",
				testUserId,
				testProjectId);

			expect(id1).not.toBe(id2);

			const boards = await boardsService.getAllProjectBoards(
				testUserId,
				testProjectId);
			expect(boards.length).toBeGreaterThanOrEqual(2);
		});

		it("should set timestamps on creation", async () => {
			const before = Date.now();
			const boardId = await boardsService.createBoard(
				"Timestamped Board",
				testUserId,
				testProjectId);
			const after = Date.now();

			const board = await boardsService.getBoard(testUserId, boardId);

			expect(board?.createdAt).toBeGreaterThanOrEqual(before);
			expect(board?.createdAt).toBeLessThanOrEqual(after);
			expect(board?.updatedAt).toBe(board?.createdAt);
		});
	});

	describe("getBoard", () => {
		it("should retrieve an existing board", async () => {
			const boardId = await createTestBoard(
				testUserId,
				testProjectId,
				"Fetch Test");

			const retrieved = await boardsService.getBoard(testUserId, boardId);

			expect(retrieved).toBeDefined();
			expect(retrieved?.id).toBe(boardId);
			expect(retrieved?.title).toBe("Fetch Test");
		});

		it("should return undefined for non-existent board", async () => {
			const retrieved = await boardsService.getBoard(
				testUserId,
				crypto.randomUUID());
			expect(retrieved).toBeUndefined();
		});

		it("should not allow fetching other user's board", async () => {
			const otherUser = await createTestUser();
			const boardId = await boardsService.createBoard(
				"Private Board",
				testUserId,
				testProjectId);

			const retrieved = await boardsService.getBoard(otherUser.id, boardId);
			expect(retrieved).toBeUndefined();
		});

		it("should update lastRequestedAt when fetching", async () => {
			const boardId = await createTestBoard(testUserId, testProjectId);

			const first = await boardsService.getBoard(testUserId, boardId);
			expect(first).toBeDefined();

			// Wait a bit to ensure time difference
			await new Promise((resolve) => setTimeout(resolve, 10));

			const second = await boardsService.getBoard(testUserId, boardId);

			expect(second?.lastRequestedAt).toBeGreaterThan(
				first?.lastRequestedAt || 0);
		});
	});

	describe("getAllProjectBoards", () => {
		it("should retrieve all boards for a project", async () => {
			await boardsService.createBoard("Board 1", testUserId, testProjectId);
			await boardsService.createBoard("Board 2", testUserId, testProjectId);
			await boardsService.createBoard("Board 3", testUserId, testProjectId);

			const boards = await boardsService.getAllProjectBoards(
				testUserId,
				testProjectId);

			expect(boards.length).toBeGreaterThanOrEqual(3);
			const titles = boards.map((b) => b.title);
			expect(titles).toContain("Board 1");
			expect(titles).toContain("Board 2");
			expect(titles).toContain("Board 3");
		});

		it("should return empty array for project with no boards", async () => {
			const newProject = await createTestProject(testUserId, "Empty Project");
			const boards = await boardsService.getAllProjectBoards(
				testUserId,
				newProject);
			expect(boards).toHaveLength(0);
		});

		it("should only return boards for specified project", async () => {
			const project2 = await createTestProject(testUserId, "Project 2");

			const board1Id = await boardsService.createBoard(
				"Project1 Board",
				testUserId,
				testProjectId);
			const board2Id = await boardsService.createBoard(
				"Project2 Board",
				testUserId,
				project2);

			const project1Boards = await boardsService.getAllProjectBoards(
				testUserId,
				testProjectId);
			const project2Boards = await boardsService.getAllProjectBoards(
				testUserId,
				project2);

			expect(project1Boards).toHaveLength(1);
			expect(project1Boards[0].id).toBe(board1Id);
			expect(project2Boards).toHaveLength(1);
			expect(project2Boards[0].id).toBe(board2Id);
		});

		it("should not return boards from other users", async () => {
			const otherUser = await createTestUser();
			const otherProjectId = await createTestProject(otherUser.id, "Other Project");

			await boardsService.createBoard(
				"My Board",
				testUserId,
				testProjectId);
			await boardsService.createBoard(
				"Other Board",
				otherUser.id,
				otherProjectId);

			const myBoards = await boardsService.getAllProjectBoards(
				testUserId,
				testProjectId);
			expect(myBoards).toHaveLength(1);
			expect(myBoards[0].title).toBe("My Board");
		});
	});

	describe("updateBoard", () => {
		it("should update board title", async () => {
			const boardId = await boardsService.createBoard(
				"Original Title",
				testUserId,
				testProjectId);

			const updated = await boardsService.updateBoard(
				testUserId,
				boardId,
				{ title: "Updated Title" });

			expect(updated?.title).toBe("Updated Title");

			const retrieved = await boardsService.getBoard(testUserId, boardId);
			expect(retrieved?.title).toBe("Updated Title");
		});

		it("should throw when updating non-existent board", async () => {
			await expect(
				boardsService.updateBoard(testUserId, crypto.randomUUID(), {
					title: "New Title",
				})
			).rejects.toThrow();
		});

		it("should not allow updating other user's board", async () => {
			const otherUser = await createTestUser();
			const boardId = await boardsService.createBoard(
				"Original",
				testUserId,
				testProjectId);

			await expect(
				boardsService.updateBoard(otherUser.id, boardId, { title: "Hacked" })
			).rejects.toThrow();

			// Verify original is unchanged
			const original = await boardsService.getBoard(testUserId, boardId);
			expect(original?.title).toBe("Original");
		});

		it("should update updatedAt timestamp", async () => {
			const boardId = await boardsService.createBoard(
				"Test",
				testUserId,
				testProjectId);

			const before = await boardsService.getBoard(testUserId, boardId);
			await new Promise((resolve) => setTimeout(resolve, 10));

			const after = await boardsService.updateBoard(testUserId, boardId, {
				title: "Updated",
			});

			expect(after?.updatedAt).toBeGreaterThan(before?.updatedAt || 0);
		});
	});

	describe("deleteBoard", () => {
		it("should delete an existing board", async () => {
			const boardId = await boardsService.createBoard(
				"To Delete",
				testUserId,
				testProjectId);

			await boardsService.deleteBoard(testUserId, boardId);

			const retrieved = await boardsService.getBoard(testUserId, boardId);
			expect(retrieved).toBeUndefined();
		});

		it("should throw when deleting non-existent board", async () => {
			await expect(
				boardsService.deleteBoard(testUserId, crypto.randomUUID())
			).rejects.toThrow();
		});

		it("should not allow deleting other user's board", async () => {
			const otherUser = await createTestUser();
			const boardId = await boardsService.createBoard(
				"Test",
				testUserId,
				testProjectId);

			await expect(
				boardsService.deleteBoard(otherUser.id, boardId)
			).rejects.toThrow();

			// Verify board still exists for original user
			const retrieved = await boardsService.getBoard(testUserId, boardId);
			expect(retrieved).toBeDefined();
		});
	});

	describe("getRecentBoards", () => {
		it("should return at most 6 recent boards", async () => {
			// Create multiple projects and boards
			for (let i = 0; i < 3; i++) {
				const projectId = await createTestProject(
					testUserId,
					`Project ${i}`);
				for (let j = 0; j < 3; j++) {
					await boardsService.createBoard(
						`Board ${i}-${j}`,
						testUserId,
						projectId);
				}
			}

			const recent = await boardsService.getRecentBoards(testUserId);
			expect(recent.length).toBeLessThanOrEqual(6);
		});

		it("should return most recently used boards first", async () => {
			const ids = new Array<string>();
			for (let i = 0; i < 3; i++) {
				const id = await boardsService.createBoard(
					`Board ${i}`,
					testUserId,
					testProjectId);
				ids.push(id);
				await new Promise((resolve) => setTimeout(resolve, 10));
			}

			// Access first board to make it recent
			await boardsService.getBoard(testUserId, ids[0]);

			const recent = await boardsService.getRecentBoards(testUserId);
			expect(recent[0].id).toBe(ids[0]);
		});

		it("should include project title in results", async () => {
			const boardId = await boardsService.createBoard(
				"Test Board",
				testUserId,
				testProjectId);

			const recent = await boardsService.getRecentBoards(testUserId);
			const found = recent.find((b) => b.id === boardId);

			expect(found).toBeDefined();
			expect(found?.project).toBeDefined();
			expect(found?.project?.title).toBe("Test Project");
		});

		it("should only return boards for specific user", async () => {
			const otherUser = await createTestUser();
			const otherProject = await createTestProject(otherUser.id, "Other");

			await boardsService.createBoard("My Board", testUserId, testProjectId);
			await boardsService.createBoard("Other Board", otherUser.id, otherProject);

			const myRecent = await boardsService.getRecentBoards(testUserId);
			const otherRecent = await boardsService.getRecentBoards(otherUser.id);

			expect(myRecent.length).toBe(1);
			expect(myRecent[0].title).toBe("My Board");
			expect(otherRecent.length).toBe(1);
			expect(otherRecent[0].title).toBe("Other Board");
		});
	});

	describe("Authorization", () => {
		it("should enforce user isolation across operations", async () => {
			const user1 = await createTestUser();
			const user2 = await createTestUser();

			const project1 = await createTestProject(user1.id, "Project 1");
			const project2 = await createTestProject(user2.id, "Project 2");

			const board1Id = await boardsService.createBoard(
				"User 1 Board",
				user1.id,
				project1);
			const board2Id = await boardsService.createBoard(
				"User 2 Board",
				user2.id,
				project2);

			// Each user can only see their own
			const user1Boards = await boardsService.getAllProjectBoards(
				user1.id,
				project1);
			const user2Boards = await boardsService.getAllProjectBoards(
				user2.id,
				project2);

			expect(user1Boards).toHaveLength(1);
			expect(user2Boards).toHaveLength(1);
			expect(user1Boards[0].id).toBe(board1Id);
			expect(user2Boards[0].id).toBe(board2Id);
		});
	});
});