import z from "zod";
import { ExportedProjectBoardSchema } from "./ExportedProjectBoard";
import { ExportedProjectBoardCheckItemSchema } from "./ExportedProjectBoardCheckItem";
import { ExportedProjectBoardItemSchema } from "./ExportedProjectBoardItem";
import { ExportedProjectBoardSectionSchema } from "./ExportedProjectBoardSection";
import { ExportedProjectDocumentSchema } from "./ExportedProjectDocument";
import { ExportedImageSchema } from "./ExportedImage";

export type ExportedProject = z.infer<typeof ExportedProjectSchema>

export const ExportedProjectSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    documents: z.array(ExportedProjectDocumentSchema),
    boards: z.array(ExportedProjectBoardSchema),
    boardSections: z.array(ExportedProjectBoardSectionSchema),
    boardItems: z.array(ExportedProjectBoardItemSchema),
    boardCheckItems: z.array(ExportedProjectBoardCheckItemSchema),
    images: z.array(ExportedImageSchema).optional(),
});