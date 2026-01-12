"use server";

import { revalidatePath } from "next/cache";
import { authActionClient } from "./safe-actions";
import z from "zod";
import { redirect } from "next/navigation";
import { createBoard, deleteBoard, updateBoard } from "../services/boards";

const createSchema = z.object({
    projectId: z.uuid().nonempty(),
    title: z.string().nonempty(),
});

const renameSchema = z.object({
    id: z.uuid().nonempty(),
    title: z.string().nonempty(),
});

const selectSchema = z.object({
    id: z.uuid().nonempty(),
});

export const createBoardAction = authActionClient
    .inputSchema(createSchema)
    .action(async ({ parsedInput, ctx }) => {
        const boardId = await createBoard(parsedInput.title, ctx.session.user?.id!, parsedInput.projectId);

        revalidatePath("/");
        revalidatePath(`/projects/${parsedInput.projectId}`);
        redirect(`/projects/${parsedInput.projectId}/boards/${boardId}`);
    });

export const renameBoardAction = authActionClient
    .inputSchema(renameSchema)
    .action(async ({ parsedInput, ctx }) => {
        const board = await updateBoard(ctx.session.user?.id!, parsedInput.id, { title: parsedInput.title });

        revalidatePath("/");
        revalidatePath(`/projects/${board.projectId}`);
        revalidatePath(`/projects/${board.projectId}/boards/${board.id}`);
    });

export const deleteBoardAction = authActionClient
    .inputSchema(selectSchema)
    .action(async ({ parsedInput, ctx }) => {
        const board = await deleteBoard(ctx.session.user?.id!, parsedInput.id);

        revalidatePath("/");
        revalidatePath(`/projects/${board.projectId}`);

        return { redirectUrl: `/projects/${board.projectId}` };
    });