import { endpoint, ok } from "@/app/api/utils";
import { createBoardSection, getBoardSections } from "@/app/services/board-sections";
import { SimpleProjectBoardSection } from "@/app/types/ProjectBoardSection";
import { NextResponse } from "next/server";
import z from "zod";

const PostSectionSchema = z.object({
    id: z.uuid().nonempty(),
    title: z.string().nonempty(),
    position: z.number().int(),
});

type PostSection = z.infer<typeof PostSectionSchema>

export const GET = endpoint<{ boardId: string }>(async ({ params, userId }) => {
    const { boardId } = params;

    const secitons = await getBoardSections(userId, boardId);
    const result: Array<SimpleProjectBoardSection> = secitons.map((s) => ({
        id: s.id,
        title: s.title,
        position: s.position,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
    }));

    return NextResponse.json(result);
});

export const POST = endpoint<{ boardId: string }, PostSection>(async ({ params, data, userId }) => {
    const { boardId } = params;

    await createBoardSection(data.id, data.title, data.position, userId, boardId);

    return ok();
}, PostSectionSchema);