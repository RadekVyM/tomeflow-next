import * as projectsService from "@/app/services/projects";

export async function createTestProject(
	userId: string,
	title: string = "Test Project"
) {
	return await projectsService.createProject(title, userId);
}