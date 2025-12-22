import { db } from "@/db";
import { projectBoardCheckItems } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

export async function getBoardItemCheckItems(userId: string, itemId: string) {
    return await db.query.projectBoardCheckItems.findMany({
        where: and(eq(projectBoardCheckItems.userId, userId), eq(projectBoardCheckItems.parentId, itemId)),
    });
}

export async function createBoardCheckItem(checkItemId: string, title: string, position: number, userId: string, itemId: string) {
    const now = Date.now();

    const newItem = await db.insert(projectBoardCheckItems).values({
        id: checkItemId,
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
    if (checkItem.position !== undefined) {
        await updateBoardCheckItemPosition(userId, checkItemId, checkItem.position);
        delete checkItem.position;
    }

    const updatedItem = await db.update(projectBoardCheckItems)
        .set({
            updatedAt: Date.now(),
            ...checkItem,
        })
        .where(and(eq(projectBoardCheckItems.userId, userId), eq(projectBoardCheckItems.id, checkItemId)))
        .returning();

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

    const itemId = item[0].parentId;

    await db.transaction(async () => {
        const checkItems = await getCheckItemsFromItem(userId, itemId);
        await updatePositionsOfSortedItems(checkItems);
    });

    return item[0];
}

async function updateBoardCheckItemPosition(userId: string, checkItemId: string, newPosition: number) {
    const itemToUpdate = await db.query.projectBoardCheckItems.findFirst({
        where: and(eq(projectBoardCheckItems.userId, userId), eq(projectBoardCheckItems.id, checkItemId))
    });

    if (!itemToUpdate) {
        throw new Error(`Check item "${checkItemId}" could not be found.`);
    }

    await db.transaction(async () => {
        const items = await getCheckItemsFromItem(userId, itemToUpdate.parentId);

        const oldPosition = items.findIndex((item) => item.id === itemToUpdate.id);
        const itemToMove = items.splice(oldPosition, 1)[0];
        items.splice(newPosition, 0, itemToMove);

        await updatePositionsOfSortedItems(items);
    });
}

async function getCheckItemsFromItem(userId: string, itemId: string) {
    return await db.query.projectBoardCheckItems.findMany({
        where: and(eq(projectBoardCheckItems.userId, userId), eq(projectBoardCheckItems.parentId, itemId)),
        orderBy: [asc(projectBoardCheckItems.position)],
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

        await db.update(projectBoardCheckItems)
            .set({
                updatedAt: now,
                position: i,
            })
            .where(eq(projectBoardCheckItems.id, item.id));
    }
}