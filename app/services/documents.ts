import { db } from "@/db";
import { projectDocuments } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export async function getAllProjectDocuments(userId: string, projectId: string) {
    return await db.query.projectDocuments.findMany({
        where: and(eq(projectDocuments.userId, userId), eq(projectDocuments.projectId, projectId)),
        orderBy: [desc(sql`MAX(${projectDocuments.lastRequestedAt}, ${projectDocuments.updatedAt})`)],
    });
}

export async function getRecentDocuments(userId: string) {
    return await db.query.projectDocuments.findMany({
        where: eq(projectDocuments.userId, userId),
        orderBy: [desc(sql`MAX(${projectDocuments.lastRequestedAt}, ${projectDocuments.updatedAt})`)],
        limit: 6,
        with: {
            project: {
                columns: { title: true },
            },
        },
    });
}

export async function getDocument(userId: string, documentId: string) {
    await db.update(projectDocuments)
        .set({ lastRequestedAt: Date.now() })
        .where(and(eq(projectDocuments.userId, userId), eq(projectDocuments.id, documentId)));

    return await db.query.projectDocuments.findFirst({
        where: and(eq(projectDocuments.userId, userId), eq(projectDocuments.id, documentId)),
    });
}

export async function createDocument(title: string, userId: string, projectId: string) {
    const now = Date.now();

    const newDocument = await db.insert(projectDocuments).values({
        title: title,
        userId: userId,
        projectId: projectId,
        content: "",
        createdAt: now,
        updatedAt: now,
        lastRequestedAt: now,
    }).returning({ id: projectDocuments.id });

    if (newDocument.length === 0) {
        throw new Error("Failed to create the document in database.");
    }

    return newDocument[0].id;
}

export async function updateDocument(
    userId: string,
    documentId: string,
    document: { title?: string, content?: string },
) {
    const updatedDocument = await db.update(projectDocuments)
        .set({
            updatedAt: Date.now(),
            ...document,
        })
        .where(and(eq(projectDocuments.userId, userId), eq(projectDocuments.id, documentId)))
        .returning();

    if (updatedDocument.length === 0) {
        throw new Error("Failed to update the document in database.");
    }

    return updatedDocument[0];
}

export async function deleteDocument(userId: string, documentId: string) {
    const document = await db.delete(projectDocuments)
        .where(and(eq(projectDocuments.userId, userId), eq(projectDocuments.id, documentId)))
        .returning();

    if (document.length === 0) {
        throw new Error("Failed to delete the document in database.");
    }

    return document[0];
}