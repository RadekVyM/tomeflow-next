"use server"

import { revalidatePath } from "next/cache";
import { authActionClient } from "./safe-actions";
import z from "zod";
import { redirect } from "next/navigation";
import { createProject } from "../services/projects";

const inputSchema = z.object({
    title: z.string().nonempty(),
});

export const createProjectAction = authActionClient
    .inputSchema(inputSchema)
    .action(async ({ parsedInput, ctx }) => {
        const projectId = await createProject(parsedInput.title, ctx.session.user?.id!);

        revalidatePath("/");
        revalidatePath("/projects");
        redirect(`/projects/${projectId}`);
    });