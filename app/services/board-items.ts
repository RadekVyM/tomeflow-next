import { db } from "@/db";
import { projectBoardItems } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getBoardItem(userId: string, itemId: string) {
    return await db.query.projectBoardItems.findFirst({
        where: and(eq(projectBoardItems.userId, userId), eq(projectBoardItems.id, itemId)),
        with: {
            checkItems: { },
        },
    });
}

export async function createBoardItem(title: string, position: number, userId: string, sectionId: string) {
    const now = Date.now();

    const newItem = await db.insert(projectBoardItems).values({
        title: title,
        userId: userId,
        parentId: sectionId,
        position: position,
        createdAt: now,
        updatedAt: now,
        lastRequestedAt: now,
    }).returning({ id: projectBoardItems.id });

    if (newItem.length === 0) {
        throw new Error("Failed to create the board item in database.");
    }

    return newItem[0].id;
}

export async function updateBoardItem(
    userId: string,
    itemId: string,
    item: {
        title?: string,
        description?: string | null,
        sectionId?: string,
        position?: number,
        isDone?: boolean,
    },
) {
    const updatedItem = await db.update(projectBoardItems)
        .set({
            updatedAt: Date.now(),
            ...item,
        })
        .where(and(eq(projectBoardItems.userId, userId), eq(projectBoardItems.id, itemId)))
        .returning();

    if (item.position !== undefined) {
        // TODO: Update positions of other items

        if (item.sectionId !== undefined) {
        }
    }

    if (updatedItem.length === 0) {
        throw new Error("Failed to update the board item in database.");
    }

    return updatedItem[0];
}

export async function deleteBoardItem(userId: string, itemId: string) {
    const item = await db.delete(projectBoardItems)
        .where(and(eq(projectBoardItems.userId, userId), eq(projectBoardItems.id, itemId)))
        .returning();

    if (item.length === 0) {
        throw new Error("Failed to delete the board item in database.");
    }

    return item[0];
}