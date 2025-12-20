"use server";

import { revalidatePath } from "next/cache";
import { authActionClient } from "./safe-actions";
import z from "zod";
import { redirect } from "next/navigation";
import { createProject, deleteProject, updateProject } from "../services/projects";
import { isNullOrWhiteSpace } from "../utils/string";

const createSchema = z.object({
    title: z.string().nonempty(),
});

const renameSchema = z.object({
    id: z.string().nonempty(),
    title: z.string().nonempty(),
});

const updateProjectDescriptionSchema = z.object({
    id: z.string().nonempty(),
    description: z.string().nullable(),
});

const selectSchema = z.object({
    id: z.string().nonempty(),
});

export const createProjectAction = authActionClient
    .inputSchema(createSchema)
    .action(async ({ parsedInput, ctx }) => {
        const projectId = await createProject(parsedInput.title, ctx.session.user?.id!);

        revalidatePath("/");
        revalidatePath("/projects");
        redirect(`/projects/${projectId}`);
    });

export const renameProjectAction = authActionClient
    .inputSchema(renameSchema)
    .action(async ({ parsedInput, ctx }) => {
        const project = await updateProject(ctx.session.user?.id!, parsedInput.id, { title: parsedInput.title });

        revalidatePath("/");
        revalidatePath("/projects");
        revalidatePath(`/projects/${project.id}`);
    });

export const updateProjectDescriptionAction = authActionClient
    .inputSchema(updateProjectDescriptionSchema)
    .action(async ({ parsedInput, ctx }) => {
        const project = await updateProject(
            ctx.session.user?.id!,
            parsedInput.id,
            {
                description: isNullOrWhiteSpace(parsedInput.description) ?
                    null :
                    parsedInput.description,
            });

        revalidatePath(`/projects/${project.id}`);
    });

export const deleteProjectAction = authActionClient
    .inputSchema(selectSchema)
    .action(async ({ parsedInput, ctx }) => {
        await deleteProject(ctx.session.user?.id!, parsedInput.id);

        revalidatePath("/");
        revalidatePath("/projects");
        redirect(`/projects`);
    });