"use server";

import z from "zod";
import { authActionClient } from "./safe-actions";
import { revalidatePath } from "next/cache";
import { importProjects } from "../services/import";
import { ExportedProjectSchema } from "../types/export/ExportedProject";

const importProjectsSchema = z.array(ExportedProjectSchema);

export const importProjectsAction = authActionClient
    .inputSchema(importProjectsSchema)
    .action(async ({ parsedInput, ctx }) => {
        await importProjects(ctx.session.user?.id!, parsedInput);

        revalidatePath("/");
        revalidatePath("/projects");
    });
