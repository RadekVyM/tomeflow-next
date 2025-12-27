import z from "zod";

export type ExportedProjectBoardSection = z.infer<typeof ExportedProjectBoardSectionSchema>

export const ExportedProjectBoardSectionSchema = z.object({
    id: z.string(),
    parentId: z.string(),
    title: z.string(),
    position: z.number().int(),
});