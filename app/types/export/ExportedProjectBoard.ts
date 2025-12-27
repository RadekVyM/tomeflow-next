import z from "zod";

export type ExportedProjectBoard = z.infer<typeof ExportedProjectBoardSchema>

export const ExportedProjectBoardSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    title: z.string(),
});