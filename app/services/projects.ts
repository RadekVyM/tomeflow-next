import { db } from "@/db";
import { projects } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function getAllProjects(userId: string) {
    return await db.query.projects.findMany({
        where: eq(projects.userId, userId),
        orderBy: [desc(projects.lastRequestedAt)],
    });
}

export async function getRecentProjects(userId: string) {
    return await db.query.projects.findMany({
        where: eq(projects.userId, userId),
        orderBy: [desc(projects.lastRequestedAt)],
        limit: 6,
    });
}

export async function getProject(userId: string, projectId: string) {
    await db.update(projects)
        .set({ lastRequestedAt: Date.now() })
        .where(and(eq(projects.userId, userId), eq(projects.id, projectId)));

    return await db.query.projects.findFirst({
        where: and(eq(projects.userId, userId), eq(projects.id, projectId)),
    });
}

export async function createProject(title: string, userId: string) {
    const now = Date.now();

    const newProject = await db.insert(projects).values({
        title: title,
        userId: userId,
        createdAt: now,
        updatedAt: now,
        lastRequestedAt: now,
    }).returning({ id: projects.id });

    if (newProject.length === 0) {
        throw new Error("Failed to create the project in database.");
    }

    return newProject[0].id;
}

export async function updateProject(
    userId: string,
    projectId: string,
    project: { title?: string, description?: string | null },
) {
    const updatedProject = await db.update(projects)
        .set({
            updatedAt: Date.now(),
            ...project,
        })
        .where(and(eq(projects.userId, userId), eq(projects.id, projectId)))
        .returning();

    if (updatedProject.length === 0) {
        throw new Error("Failed to update the project in database.");
    }

    return updatedProject[0];
}

export async function deleteProject(userId: string, projectId: string) {
    await db.delete(projects)
        .where(and(eq(projects.userId, userId), eq(projects.id, projectId)));
}