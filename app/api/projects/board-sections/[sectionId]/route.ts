import { endpoint, ok } from "@/app/api/utils";
import { deleteBoardSection, updateBoardSection } from "@/app/services/board-sections";
import z from "zod";

const PutSectionSchema = z.object({
    title: z.string().nonempty().optional(),
    position: z.number().int().optional(),
});

type PutSection = z.infer<typeof PutSectionSchema>

export const PUT = endpoint<{ sectionId: string }, PutSection>(async ({ params, data, userId }) => {
    const { sectionId } = params;

    await updateBoardSection(userId, sectionId, data);

    return ok();
}, PutSectionSchema);

export const DELETE = endpoint<{ sectionId: string }>(async ({ params, userId }) => {
    const { sectionId } = params;

    await deleteBoardSection(userId, sectionId);

    return ok();
});