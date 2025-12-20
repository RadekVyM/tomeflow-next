import { endpoint, ok } from "@/app/api/utils";
import { createBoardItem } from "@/app/services/board-items";
import z from "zod";

const PostItemSchema = z.object({
    title: z.string().nonempty(),
    position: z.number().int(),
});

type PostItem = z.infer<typeof PostItemSchema>

export const POST = endpoint<{ sectionId: string }, PostItem>(async ({ params, data, userId }) => {
    const { sectionId } = params;

    await createBoardItem(data.title, data.position, userId, sectionId);

    return ok();
}, PostItemSchema);