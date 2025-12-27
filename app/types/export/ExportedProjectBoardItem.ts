import z from "zod";

export type ExportedProjectBoardItem = z.infer<typeof ExportedProjectBoardItemSchema>

export const ExportedProjectBoardItemSchema = z.object({
    id: z.string(),
    parentId: z.string(),
    title: z.string(),
    position: z.number().int(),
    isDone: z.boolean(),
    description: z.string().nullable().optional(),
});