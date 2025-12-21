import { endpoint, ok } from "@/app/api/utils";
import { createBoardSection } from "@/app/services/board-sections";
import z from "zod";

const PostSectionSchema = z.object({
    id: z.string().nonempty(),
    title: z.string().nonempty(),
    position: z.number().int(),
});

type PostSection = z.infer<typeof PostSectionSchema>

export const POST = endpoint<{ boardId: string }, PostSection>(async ({ params, data, userId }) => {
    const { boardId } = params;

    await createBoardSection(data.id, data.title, data.position, userId, boardId);

    return ok();
}, PostSectionSchema);