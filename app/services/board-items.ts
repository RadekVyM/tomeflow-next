import { db } from "@/db";
import { projectBoardItems } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

export async function getBoardItem(userId: string, itemId: string) {
    return await db.query.projectBoardItems.findFirst({
        where: and(eq(projectBoardItems.userId, userId), eq(projectBoardItems.id, itemId)),
        with: {
            section: {
                columns: {
                    title: true,
                }
            },
            checkItems: { },
        },
    });
}

export async function createBoardItem(itemId: string, title: string, position: number, userId: string, sectionId: string) {
    const now = Date.now();

    const newItem = await db.insert(projectBoardItems).values({
        id: itemId,
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
    if (item.sectionId !== undefined && item.position !== undefined) {
        await moveBoardItemToSection(userId, itemId, item.sectionId, item.position);
        delete item.sectionId;
        delete item.position;
    }
    else if (item.position !== undefined) {
        await updateBoardItemPosition(userId, itemId, item.position);
        delete item.position;
    }
    else if (item.sectionId !== undefined) {
        throw new Error("Target position needs to be defined too.");
    }

    const updatedItem = await db.update(projectBoardItems)
        .set({
            updatedAt: Date.now(),
            ...item,
        })
        .where(and(eq(projectBoardItems.userId, userId), eq(projectBoardItems.id, itemId)))
        .returning();

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

    const sectionId = item[0].parentId;

    await db.transaction(async () => {
        const items = await getItemsFromSection(userId, sectionId);
        await updatePositionsOfSortedItems(items);
    });

    return item[0];
}

async function moveBoardItemToSection(userId: string, itemId: string, targetSectionId: string, newPosition: number) {
    const itemToUpdate = await findItemById(userId, itemId);

    if (targetSectionId === itemToUpdate.parentId) {
        await updateBoardItemPosition(userId, itemId, newPosition);
        return;
    }

    await db.transaction(async () => {
        const sourceSectionId = itemToUpdate.parentId;
        const targetItems = await getItemsFromSection(userId, targetSectionId);
        targetItems.splice(newPosition, 0, { id: itemId, position: itemToUpdate.position, parentId: itemToUpdate.parentId, });
        await updatePositionsOfSortedItems(targetItems, targetSectionId);

        const sourceItems = await getItemsFromSection(userId, sourceSectionId);
        await updatePositionsOfSortedItems(sourceItems);
    });
}

async function updateBoardItemPosition(userId: string, itemId: string, newPosition: number) {
    const itemToUpdate = await findItemById(userId, itemId);

    await db.transaction(async () => {
        const items = await getItemsFromSection(userId, itemToUpdate.parentId);

        const oldPosition = items.findIndex((item) => item.id === itemToUpdate.id);
        const itemToMove = items.splice(oldPosition, 1)[0];
        items.splice(newPosition, 0, itemToMove);

        await updatePositionsOfSortedItems(items);
    });
}

async function findItemById(userId: string, itemId: string) {
    const item = await db.query.projectBoardItems.findFirst({
        where: and(eq(projectBoardItems.userId, userId), eq(projectBoardItems.id, itemId))
    });

    if (!item) {
        throw new Error(`Item "${itemId}" could not be found.`);
    }

    return item;
}

async function getItemsFromSection(userId: string, sectionId: string) {
    return await db.query.projectBoardItems.findMany({
        where: and(eq(projectBoardItems.userId, userId), eq(projectBoardItems.parentId, sectionId)),
        orderBy: [asc(projectBoardItems.position)],
        columns: {
            id: true,
            position: true,
            parentId: true,
        },
    });
}

async function updatePositionsOfSortedItems(items: Array<{ id: string, position: number, parentId: string, }>, sectionId?: string) {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const now = Date.now();

        if (item.position === i && sectionId === item.parentId) {
            continue;
        }

        await db.update(projectBoardItems)
            .set({
                updatedAt: now,
                position: i,
                parentId: sectionId,
            })
            .where(eq(projectBoardItems.id, item.id));
    }
}