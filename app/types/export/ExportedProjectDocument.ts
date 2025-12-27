import z from "zod";

export type ExportedProjectDocument = z.infer<typeof ExportedProjectDocumentSchema>

export const ExportedProjectDocumentSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    title: z.string(),
    content: z.string(),
});