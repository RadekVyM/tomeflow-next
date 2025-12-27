import z from "zod";

export type ExportedProjectBoardCheckItem = z.infer<typeof ExportedProjectBoardCheckItemSchema>

export const ExportedProjectBoardCheckItemSchema = z.object({
    id: z.string(),
    parentId: z.string(),
    title: z.string(),
    position: z.number().int(),
    isDone: z.boolean(),
});