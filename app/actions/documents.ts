"use server";

import { revalidatePath } from "next/cache";
import { authActionClient } from "./safe-actions";
import z from "zod";
import { redirect } from "next/navigation";
import { createDocument, deleteDocument, updateDocument } from "../services/documents";

const createSchema = z.object({
    projectId: z.uuid().nonempty(),
    title: z.string().nonempty(),
});

const renameSchema = z.object({
    id: z.uuid().nonempty(),
    title: z.string().nonempty(),
});

const updateContentSchema = z.object({
    id: z.uuid().nonempty(),
    content: z.string(),
});

const selectSchema = z.object({
    id: z.uuid().nonempty(),
});

export const createDocumentAction = authActionClient
    .inputSchema(createSchema)
    .action(async ({ parsedInput, ctx }) => {
        const documentId = await createDocument(parsedInput.title, ctx.session.user?.id!, parsedInput.projectId);

        revalidatePath("/");
        revalidatePath(`/projects/${parsedInput.projectId}`);
        redirect(`/projects/${parsedInput.projectId}/documents/${documentId}`);
    });

export const renameDocumentAction = authActionClient
    .inputSchema(renameSchema)
    .action(async ({ parsedInput, ctx }) => {
        const document = await updateDocument(ctx.session.user?.id!, parsedInput.id, { title: parsedInput.title });

        revalidatePath("/");
        revalidatePath(`/projects/${document.projectId}`);
        revalidatePath(`/projects/${document.projectId}/documents/${document.id}`);
    });

export const updateDocumentContentAction = authActionClient
    .inputSchema(updateContentSchema)
    .action(async ({ parsedInput, ctx }) => {
        const document = await updateDocument(
            ctx.session.user?.id!,
            parsedInput.id,
            {
                content: parsedInput.content,
            });

        revalidatePath(`/projects/${document.projectId}/documents/${document.id}`);
    });

export const deleteDocumentAction = authActionClient
    .inputSchema(selectSchema)
    .action(async ({ parsedInput, ctx }) => {
        const document = await deleteDocument(ctx.session.user?.id!, parsedInput.id);

        revalidatePath("/");
        revalidatePath(`/projects/${document.projectId}`);
        redirect(`/projects/${document.projectId}`);
    });