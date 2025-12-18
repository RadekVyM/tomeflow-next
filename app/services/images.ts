import { db } from "@/db";
import { dataImages } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export async function getImagesFromProject(userId: string, projectId: string) {
    return await db.query.dataImages.findMany({
        where: and(eq(dataImages.userId, userId), eq(dataImages.projectId, projectId)),
    });
}

export async function getImages(userId: string, imageIds: Array<string>) {
    return await db.query.dataImages.findMany({
        where: and(eq(dataImages.userId, userId), inArray(dataImages.id, imageIds)),
    });
}

export async function createImage(dataUrl: string, title: string, projectId: string, userId: string) {
    const now = Date.now();

    const newImage = await db.insert(dataImages).values({
        imageData: dataUrl,
        title: title,
        userId: userId,
        projectId: projectId,
        uploadedAt: now,
    }).returning({ id: dataImages.id });

    if (newImage.length === 0) {
        throw new Error("Failed to create the image in database.");
    }

    return newImage[0].id;
}

export async function deleteImage(userId: string, imageId: string) {
    await db.delete(dataImages)
        .where(and(eq(dataImages.userId, userId), eq(dataImages.id, imageId)));
}