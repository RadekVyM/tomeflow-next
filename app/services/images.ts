import { db } from "@/db";
import { vercelImages } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { del } from "@vercel/blob";

export async function getImage(userId: string, imageId: string) {
    return await db.query.vercelImages.findFirst({
        where: and(eq(vercelImages.userId, userId), eq(vercelImages.id, imageId)),
    });
}

export async function getImagesFromProject(userId: string, projectId: string) {
    return await db.query.vercelImages.findMany({
        where: and(eq(vercelImages.userId, userId), eq(vercelImages.projectId, projectId)),
    });
}

export async function getImages(userId: string, imageIds: Array<string>) {
    return await db.query.vercelImages.findMany({
        where: and(eq(vercelImages.userId, userId), inArray(vercelImages.id, imageIds)),
    });
}

export async function createImage(blobUrl: string, title: string, projectId: string, userId: string) {
    const now = Date.now();

    const newImage = await db.insert(vercelImages).values({
        blobUrl: blobUrl,
        title: title,
        userId: userId,
        projectId: projectId,
        uploadedAt: now,
    }).returning({ id: vercelImages.id });

    if (newImage.length === 0) {
        throw new Error("Failed to create the image in database.");
    }

    return newImage[0].id;
}

export async function deleteImage(userId: string, imageId: string) {
    const image = await db.delete(vercelImages)
        .where(and(eq(vercelImages.userId, userId), eq(vercelImages.id, imageId)))
        .returning();

    if (image.length === 0) {
        throw new Error("Failed to delete the image in database.");
    }

    const url = image[0].blobUrl;
    await del(url);
}

export async function deleteImagesFromProject(userId: string, projectId: string) {
    const images = await db.delete(vercelImages)
        .where(and(eq(vercelImages.userId, userId), eq(vercelImages.projectId, projectId)))
        .returning({ vercelUrl: vercelImages.blobUrl });

    await del(images.map((u) => u.vercelUrl));
}