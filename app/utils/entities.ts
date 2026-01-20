import { ProjectBoardSchema, ProjectDocumentSchema } from "@/db/schema";
import { TbFile, TbLayoutDashboard } from "react-icons/tb";

export function lastSeenAt(entity: {
    createdAt: number,
    updatedAt: number,
    lastRequestedAt: number,
}) {
    return Math.max(entity.createdAt, entity.updatedAt, entity.lastRequestedAt);
}

export function mergeDocumentsAndBoards<TBoard extends ProjectBoardSchema, TDocument extends ProjectDocumentSchema>(
    boards: Array<TBoard>,
    documents: Array<TDocument>,
    limit?: number,
) {
    const items = [
        ...boards.map((b) => ({
            ...b,
            url: `/projects/${b.projectId}/boards/${b.id}`,
            icon: TbLayoutDashboard,
        })),
        ...documents.map((d) => ({
            ...d,
            url: `/projects/${d.projectId}/documents/${d.id}`,
            icon: TbFile,
        })),
    ].slice(0, limit);

    items.sort((a, b) => lastSeenAt(b) - lastSeenAt(a));

    return items;
}