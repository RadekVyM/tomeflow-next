import { db } from "@/db";
import { projectBoardSections } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getBoardSections(userId: string, boardId: string) {
    return await db.query.projectBoardSections.findMany({
        where: and(eq(projectBoardSections.userId, userId), eq(projectBoardSections.parentId, boardId)),
        with: {
            items: {
                with: {
                    checkItems: {
                        columns: { isDone: true, }
                    }
                }
            }
        }
    });
}

export async function createBoardSection(title: string, position: number, userId: string, boardId: string) {
    const now = Date.now();

    const newSection = await db.insert(projectBoardSections).values({
        title: title,
        userId: userId,
        parentId: boardId,
        position: position,
        createdAt: now,
        updatedAt: now,
    }).returning({ id: projectBoardSections.id });

    if (newSection.length === 0) {
        throw new Error("Failed to create the board section in database.");
    }

    return newSection[0].id;
}

export async function updateBoardSection(
    userId: string,
    sectionId: string,
    section: { title?: string, position?: number, },
) {
    const updatedSection = await db.update(projectBoardSections)
        .set({
            updatedAt: Date.now(),
            ...section,
        })
        .where(and(eq(projectBoardSections.userId, userId), eq(projectBoardSections.id, sectionId)))
        .returning();

    if (section.position !== undefined) {
        // TODO: Update positions of other sections
    }

    if (updatedSection.length === 0) {
        throw new Error("Failed to update the board section in database.");
    }

    return updatedSection[0];
}

export async function deleteBoardSection(userId: string, sectionId: string) {
    const section = await db.delete(projectBoardSections)
        .where(and(eq(projectBoardSections.userId, userId), eq(projectBoardSections.id, sectionId)))
        .returning();

    if (section.length === 0) {
        throw new Error("Failed to delete the board section in database.");
    }

    return section[0];
}