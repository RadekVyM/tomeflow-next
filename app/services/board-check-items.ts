import { db } from "@/db";
import { projectBoardCheckItems } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getBoardItemCheckItems(userId: string, itemId: string) {
    return await db.query.projectBoardCheckItems.findMany({
        where: and(eq(projectBoardCheckItems.userId, userId), eq(projectBoardCheckItems.parentId, itemId)),
    });
}

export async function createBoardCheckItem(title: string, position: number, userId: string, itemId: string) {
    const now = Date.now();

    const newItem = await db.insert(projectBoardCheckItems).values({
        title: title,
        userId: userId,
        parentId: itemId,
        position: position,
        createdAt: now,
        updatedAt: now,
    }).returning({ id: projectBoardCheckItems.id });

    if (newItem.length === 0) {
        throw new Error("Failed to create the board check item in database.");
    }

    return newItem[0].id;
}

export async function updateBoardCheckItem(
    userId: string,
    checkItemId: string,
    checkItem: {
        title?: string,
        position?: number,
        isDone?: boolean,
    },
) {
    const updatedItem = await db.update(projectBoardCheckItems)
        .set({
            updatedAt: Date.now(),
            ...checkItem,
        })
        .where(and(eq(projectBoardCheckItems.userId, userId), eq(projectBoardCheckItems.id, checkItemId)))
        .returning();

    if (checkItem.position !== undefined) {
        // TODO: Update positions of other items

    }

    if (updatedItem.length === 0) {
        throw new Error("Failed to update the board check item in database.");
    }

    return updatedItem[0];
}

export async function deleteBoardCheckItem(userId: string, checkItemId: string) {
    const item = await db.delete(projectBoardCheckItems)
        .where(and(eq(projectBoardCheckItems.userId, userId), eq(projectBoardCheckItems.id, checkItemId)))
        .returning();

    if (item.length === 0) {
        throw new Error("Failed to delete the board check item in database.");
    }

    return item[0];
}