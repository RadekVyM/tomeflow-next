import z from "zod";

export type ExportedImage = z.infer<typeof ExportedImageSchema>

export const ExportedImageSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    title: z.string(),
    blobUrl: z.string().optional(),
});