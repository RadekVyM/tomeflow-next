import { endpoint, ok } from "@/app/api/utils";
import { getBoardItemCheckItems } from "@/app/services/board-check-items";
import { deleteBoardItem, getBoardItem, updateBoardItem } from "@/app/services/board-items";
import { ProjectBoardItem } from "@/app/types/ProjectBoardItem";
import { lastSeenAt } from "@/app/utils/entities";
import { NextResponse } from "next/server";
import z from "zod";

const PutItemSchema = z.object({
    title: z.string().nonempty().optional(),
    description: z.string().nullable().optional(),
    sectionId: z.string().nonempty().optional(),
    position: z.number().int().optional(),
    isDone: z.boolean().optional(),
});

type PutItem = z.infer<typeof PutItemSchema>

export const GET = endpoint<{ itemId: string }>(async ({ params, userId }) => {
    const { itemId } = params;

    const item = await getBoardItem(userId, itemId);

    if (!item) {
        return NextResponse.json({ message: "Not found." }, { status: 404 });
    }

    const result: ProjectBoardItem = {
        id: item.id,
        sectionId: item.parentId,
        title: item.title,
        description: item.description || undefined,
        isDone: item.isDone,
        position: item.position,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        lastRequestedAt: item.lastRequestedAt,
        lastSeenAt: lastSeenAt(item),
        checkItems: item.checkItems.map((ci) => ({
            id: ci.id,
            title: ci.title,
            isDone: ci.isDone,
            itemId: ci.parentId,
            position: ci.position,
        })),
    };

    return ok(result);
});

export const PUT = endpoint<{ itemId: string }, PutItem>(async ({ params, userId, data }) => {
    const { itemId } = params;

    const updatedItem = await updateBoardItem(userId, itemId, data);
    const checkItems = await getBoardItemCheckItems(userId, itemId);

    const item: ProjectBoardItem = {
        id: updatedItem.id,
        sectionId: updatedItem.parentId,
        title: updatedItem.title,
        description: updatedItem.description || undefined,
        isDone: updatedItem.isDone,
        position: updatedItem.position,
        createdAt: updatedItem.createdAt,
        updatedAt: updatedItem.updatedAt,
        lastRequestedAt: updatedItem.lastRequestedAt,
        lastSeenAt: lastSeenAt(updatedItem),
        checkItems: checkItems.map((ci) => ({
            id: ci.id,
            title: ci.title,
            isDone: ci.isDone,
            itemId: ci.parentId,
            position: ci.position,
        })),
    };

    return ok(item);
}, PutItemSchema);

export const DELETE = endpoint<{ itemId: string }>(async ({ params, userId }) => {
    const { itemId } = params;

    await deleteBoardItem(userId, itemId);

    return ok();
});