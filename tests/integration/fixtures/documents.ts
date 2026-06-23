import * as documentsService from "@/app/services/documents";

export async function createTestDocument(
    userId: string,
    projectId: string,
    title: string = "Test Document"
) {
    return await documentsService.createDocument(title, userId, projectId);
}