import { endpoint, ok } from "@/app/api/utils";
import { createBoardCheckItem } from "@/app/services/board-check-items";
import z from "zod";

const PostCheckItemSchema = z.object({
    id: z.string().nonempty(),
    title: z.string().nonempty(),
    position: z.number().int(),
});

type PostCheckItem = z.infer<typeof PostCheckItemSchema>

export const POST = endpoint<{ itemId: string }, PostCheckItem>(async ({ params, userId, data }) => {
    const { itemId } = params;

    await createBoardCheckItem(data.id, data.title, data.position, userId, itemId);

    return ok();
}, PostCheckItemSchema);