import { endpoint, ok } from "@/app/api/utils";
import { deleteBoardCheckItem, updateBoardCheckItem } from "@/app/services/board-check-items";
import z from "zod";

const PutCheckItemSchema = z.object({
    title: z.string().nonempty().optional(),
    position: z.number().int().optional(),
    isDone: z.boolean().optional(),
});

type PutCheckItem = z.infer<typeof PutCheckItemSchema>

export const PUT = endpoint<{ checkItemId: string }, PutCheckItem>(async ({ params, userId, data }) => {
    const { checkItemId } = params;

    await updateBoardCheckItem(userId, checkItemId, data);

    return ok();
}, PutCheckItemSchema);

export const DELETE = endpoint<{ checkItemId: string }>(async ({ params, userId }) => {
    const { checkItemId } = params;

    await deleteBoardCheckItem(userId, checkItemId);

    return ok();
});