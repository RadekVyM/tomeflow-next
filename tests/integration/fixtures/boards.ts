import * as boardsService from "@/app/services/boards";

export async function createTestBoard(
	userId: string,
	projectId: string,
	title: string = "Test Board"
) {
	return await boardsService.createBoard(title, userId, projectId);
}
