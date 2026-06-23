import * as imagesService from "@/app/services/images";

export async function createTestImage(
    userId: string,
    projectId: string,
    title: string = "Test Image"
) {
    const imageId = crypto.randomUUID();
    const blobUrl = `https://example.com/images/${imageId}.png`;
    return await imagesService.createImage(imageId, blobUrl, title, projectId, userId);
}
