import { db } from "@/db";
import { projectBoards } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export async function getAllProjectBoards(userId: string, projectId: string) {
    return await db.query.projectBoards.findMany({
        where: and(eq(projectBoards.userId, userId), eq(projectBoards.projectId, projectId)),
        orderBy: [desc(sql`MAX(${projectBoards.lastRequestedAt}, ${projectBoards.updatedAt})`)],
    });
}

export async function getRecentBoards(userId: string) {
    return await db.query.projectBoards.findMany({
        where: eq(projectBoards.userId, userId),
        orderBy: [desc(sql`MAX(${projectBoards.lastRequestedAt}, ${projectBoards.updatedAt})`)],
        limit: 6,
        with: {
            project: {
                columns: { title: true },
            },
        },
    });
}

export async function getBoard(userId: string, boardId: string) {
    await db.update(projectBoards)
        .set({ lastRequestedAt: Date.now() })
        .where(and(eq(projectBoards.userId, userId), eq(projectBoards.id, boardId)));

    return await db.query.projectBoards.findFirst({
        where: and(eq(projectBoards.userId, userId), eq(projectBoards.id, boardId)),
    });
}

export async function createBoard(title: string, userId: string, projectId: string) {
    const now = Date.now();

    const newBoard = await db.insert(projectBoards).values({
        title: title,
        userId: userId,
        projectId: projectId,
        createdAt: now,
        updatedAt: now,
        lastRequestedAt: now,
    }).returning({ id: projectBoards.id });

    if (newBoard.length === 0) {
        throw new Error("Failed to create the board in database.");
    }

    return newBoard[0].id;
}

export async function updateBoard(
    userId: string,
    boardId: string,
    board: { title?: string },
) {
    const updatedBoard = await db.update(projectBoards)
        .set({
            updatedAt: Date.now(),
            ...board,
        })
        .where(and(eq(projectBoards.userId, userId), eq(projectBoards.id, boardId)))
        .returning();

    if (updatedBoard.length === 0) {
        throw new Error("Failed to update the board in database.");
    }

    return updatedBoard[0];
}

export async function deleteBoard(userId: string, boardId: string) {
    const board = await db.delete(projectBoards)
        .where(and(eq(projectBoards.userId, userId), eq(projectBoards.id, boardId)))
        .returning();

    if (board.length === 0) {
        throw new Error("Failed to delete the board in database.");
    }

    return board[0];
}