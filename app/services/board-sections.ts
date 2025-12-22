import { db } from "@/db";
import { projectBoardSections } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

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

export async function createBoardSection(sectionId: string, title: string, position: number, userId: string, boardId: string) {
    const now = Date.now();

    const newSection = await db.insert(projectBoardSections).values({
        id: sectionId,
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
    if (section.position !== undefined) {
        await updateBoardSectionPosition(userId, sectionId, section.position);
        delete section.position;
    }

    const updatedSection = await db.update(projectBoardSections)
        .set({
            updatedAt: Date.now(),
            ...section,
        })
        .where(and(eq(projectBoardSections.userId, userId), eq(projectBoardSections.id, sectionId)))
        .returning();

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

    const boardId = section[0].parentId;

    await db.transaction(async () => {
        const items = await getSectionsFromBoard(userId, boardId);
        await updatePositionsOfSortedItems(items);
    });

    return section[0];
}

async function updateBoardSectionPosition(userId: string, sectionId: string, newPosition: number) {
    const sectionToUpdate = await db.query.projectBoardSections.findFirst({
        where: and(eq(projectBoardSections.userId, userId), eq(projectBoardSections.id, sectionId))
    });

    if (!sectionToUpdate) {
        throw new Error(`Section "${sectionId}" could not be found.`);
    }

    await db.transaction(async () => {
        const items = await getSectionsFromBoard(userId, sectionToUpdate.parentId);

        const oldPosition = items.findIndex((item) => item.id === sectionToUpdate.id);
        const itemToMove = items.splice(oldPosition, 1)[0];
        items.splice(newPosition, 0, itemToMove);

        await updatePositionsOfSortedItems(items);
    });
}

async function getSectionsFromBoard(userId: string, boardId: string) {
    return await db.query.projectBoardSections.findMany({
        where: and(eq(projectBoardSections.userId, userId), eq(projectBoardSections.parentId, boardId)),
        orderBy: [asc(projectBoardSections.position)],
        columns: {
            id: true,
            position: true,
        },
    });
}

async function updatePositionsOfSortedItems(items: Array<{ id: string, position: number, }>) {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const now = Date.now();

        if (item.position === i) {
            continue;
        }

        await db.update(projectBoardSections)
            .set({
                updatedAt: now,
                position: i,
            })
            .where(eq(projectBoardSections.id, item.id));
    }
}