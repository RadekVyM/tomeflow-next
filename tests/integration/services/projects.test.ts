import { describe, it, expect, beforeEach } from "vitest";
import * as projectsService from "@/app/services/projects";
import { createTestUser } from "../fixtures/users";

describe("Projects Service Integration Tests", () => {
	let testUserId: string;

	beforeEach(async () => {
		const user = await createTestUser();
		testUserId = user.id;
	});

	describe("createProject", () => {
		it("should create a project with valid data", async () => {
			const projectId = await projectsService.createProject(
				"My Project",
				testUserId
			);

			expect(projectId).toBeDefined();
			expect(typeof projectId).toBe("string");

			const project = await projectsService.getProject(testUserId, projectId);
			expect(project).toBeDefined();
			expect(project?.title).toBe("My Project");
			expect(project?.userId).toBe(testUserId);
		});

		it("should create multiple projects for same user", async () => {
			const id1 = await projectsService.createProject("Project 1", testUserId);
			const id2 = await projectsService.createProject("Project 2", testUserId);

			expect(id1).not.toBe(id2);

			const proj1 = await projectsService.getProject(testUserId, id1);
			const proj2 = await projectsService.getProject(testUserId, id2);

			expect(proj1?.title).toBe("Project 1");
			expect(proj2?.title).toBe("Project 2");
		});

		it("should set timestamps on creation", async () => {
			const before = Date.now();
			const projectId = await projectsService.createProject(
				"Timestamped Project",
				testUserId
			);
			const after = Date.now();

			const project = await projectsService.getProject(testUserId, projectId);

			expect(project?.createdAt).toBeGreaterThanOrEqual(before);
			expect(project?.createdAt).toBeLessThanOrEqual(after);
			expect(project?.updatedAt).toBe(project?.createdAt);
		});
	});

	describe("getProject", () => {
		it("should retrieve an existing project", async () => {
			const projectId = await projectsService.createProject(
				"Fetch Test",
				testUserId
			);

			const retrieved = await projectsService.getProject(
				testUserId,
				projectId
			);

			expect(retrieved).toBeDefined();
			expect(retrieved?.id).toBe(projectId);
			expect(retrieved?.title).toBe("Fetch Test");
		});

		it("should return null for non-existent project", async () => {
			const retrieved = await projectsService.getProject(
				testUserId,
				crypto.randomUUID()
			);
			expect(retrieved).toBeUndefined();
		});

		it("should not allow fetching other user's project", async () => {
			const otherUser = await createTestUser();
			const projectId = await projectsService.createProject(
				"Private Project",
				testUserId
			);

			const retrieved = await projectsService.getProject(
				otherUser.id,
				projectId
			);
			expect(retrieved).toBeUndefined();
		});

		it("should update lastRequestedAt when fetching", async () => {
			const projectId = await projectsService.createProject(
				"Test",
				testUserId
			);

			const first = await projectsService.getProject(testUserId, projectId);
			expect(first).toBeDefined();

			// Wait a bit to ensure time difference
			await new Promise((resolve) => setTimeout(resolve, 10));

			const second = await projectsService.getProject(testUserId, projectId);

			expect(second?.lastRequestedAt).toBeGreaterThan(
				first?.lastRequestedAt || 0
			);
		});
	});

	describe("getAllProjects", () => {
		it("should retrieve all projects for a user", async () => {
			await projectsService.createProject("Project 1", testUserId);
			await projectsService.createProject("Project 2", testUserId);
			await projectsService.createProject("Project 3", testUserId);

			const projects = await projectsService.getAllProjects(testUserId);

			expect(projects.length).toBeGreaterThanOrEqual(3);
			const titles = projects.map((p) => p.title);
			expect(titles).toContain("Project 1");
			expect(titles).toContain("Project 2");
			expect(titles).toContain("Project 3");
		});

		it("should return empty array for user with no projects", async () => {
			const newUser = await createTestUser();
			const projects = await projectsService.getAllProjects(newUser.id);
			expect(projects).toHaveLength(0);
		});

		it("should only return projects for the specific user", async () => {
			const user2 = await createTestUser();

			const id1 = await projectsService.createProject(
				"User1 Project",
				testUserId
			);
			const id2 = await projectsService.createProject(
				"User2 Project",
				user2.id
			);

			const user1Projects = await projectsService.getAllProjects(testUserId);
			const user2Projects = await projectsService.getAllProjects(user2.id);

			expect(user1Projects).toHaveLength(1);
			expect(user1Projects[0].id).toBe(id1);
			expect(user2Projects).toHaveLength(1);
			expect(user2Projects[0].id).toBe(id2);
		});

		it("should order by lastRequestedAt descending", async () => {
			const id1 = await projectsService.createProject(
				"Project 1",
				testUserId
			);
			await new Promise((resolve) => setTimeout(resolve, 10));

			const id2 = await projectsService.createProject(
				"Project 2",
				testUserId
			);
			await new Promise((resolve) => setTimeout(resolve, 10));

			// Fetch first project to update its lastRequestedAt
			await projectsService.getProject(testUserId, id1);

			const projects = await projectsService.getAllProjects(testUserId);
			expect(projects[0].id).toBe(id1);
			expect(projects[1].id).toBe(id2);
		});
	});

	describe("updateProject", () => {
		it("should update project title", async () => {
			const projectId = await projectsService.createProject(
				"Original Name",
				testUserId
			);

			const updated = await projectsService.updateProject(testUserId, projectId, {
				title: "Updated Name",
			});

			expect(updated?.title).toBe("Updated Name");

			const retrieved = await projectsService.getProject(
				testUserId,
				projectId
			);
			expect(retrieved?.title).toBe("Updated Name");
		});

		it("should update project description", async () => {
			const projectId = await projectsService.createProject("Test", testUserId);

			const updated = await projectsService.updateProject(testUserId, projectId, {
				description: "New description",
			});

			expect(updated?.description).toBe("New description");
		});

		it("should update both title and description", async () => {
			const projectId = await projectsService.createProject("Test", testUserId);

			const updated = await projectsService.updateProject(testUserId, projectId, {
				title: "New Title",
				description: "New Description",
			});

			expect(updated?.title).toBe("New Title");
			expect(updated?.description).toBe("New Description");
		});

		it("should throw when updating non-existent project", async () => {
			await expect(
				projectsService.updateProject(testUserId, crypto.randomUUID(), {
					title: "New Name",
				})
			).rejects.toThrow();
		});

		it("should not allow updating other user's project", async () => {
			const otherUser = await createTestUser();
			const projectId = await projectsService.createProject("Test", testUserId);

			await expect(
				projectsService.updateProject(otherUser.id, projectId, {
					title: "Hacked",
				})
			).rejects.toThrow();

			// Verify original is unchanged
			const original = await projectsService.getProject(testUserId, projectId);
			expect(original?.title).toBe("Test");
		});

		it("should update updatedAt timestamp", async () => {
			const projectId = await projectsService.createProject("Test", testUserId);

			const before = await projectsService.getProject(testUserId, projectId);
			await new Promise((resolve) => setTimeout(resolve, 10));

			const after = await projectsService.updateProject(testUserId, projectId, {
				title: "Updated",
			});

			expect(after?.updatedAt).toBeGreaterThan(before?.updatedAt || 0);
		});
	});

	describe("deleteProject", () => {
		it("should delete an existing project", async () => {
			const projectId = await projectsService.createProject(
				"To Delete",
				testUserId
			);

			await projectsService.deleteProject(testUserId, projectId);

			const retrieved = await projectsService.getProject(testUserId, projectId);
			expect(retrieved).toBeUndefined();
		});

		it("should silently succeed when deleting non-existent project", async () => {
			// deleteProject doesn't throw, it just doesn't delete anything
			await projectsService.deleteProject(testUserId, crypto.randomUUID());
		});

		it("should not allow deleting other user's project", async () => {
			const otherUser = await createTestUser();
			const projectId = await projectsService.createProject("Test", testUserId);

			await projectsService.deleteProject(otherUser.id, projectId);

			// Verify project still exists for original user
			const retrieved = await projectsService.getProject(testUserId, projectId);
			expect(retrieved).toBeDefined();
		});
	});

	describe("Authorization", () => {
		it("should enforce user isolation across operations", async () => {
			const user1 = await createTestUser();
			const user2 = await createTestUser();

			const user1ProjectId = await projectsService.createProject(
				"User 1 Project",
				user1.id
			);
			const user2ProjectId = await projectsService.createProject(
				"User 2 Project",
				user2.id
			);

			// Each user can only see their own
			const user1Projects = await projectsService.getAllProjects(user1.id);
			const user2Projects = await projectsService.getAllProjects(user2.id);

			expect(user1Projects).toHaveLength(1);
			expect(user2Projects).toHaveLength(1);
			expect(user1Projects[0].id).toBe(user1ProjectId);
			expect(user2Projects[0].id).toBe(user2ProjectId);
		});
	});

	describe("getRecentProjects", () => {
		it("should return at most 6 projects", async () => {
			for (let i = 0; i < 10; i++) {
				await projectsService.createProject(`Project ${i}`, testUserId);
			}

			const recent = await projectsService.getRecentProjects(testUserId);
			expect(recent.length).toBeLessThanOrEqual(6);
		});

		it("should return most recently used projects", async () => {
			const ids: string[] = [];
			for (let i = 0; i < 3; i++) {
				const id = await projectsService.createProject(
					`Project ${i}`,
					testUserId
				);
				ids.push(id);
				await new Promise((resolve) => setTimeout(resolve, 10));
			}

			// Access first project to make it recent
			await projectsService.getProject(testUserId, ids[0]);

			const recent = await projectsService.getRecentProjects(testUserId);
			expect(recent[0].id).toBe(ids[0]);
		});
	});
});
