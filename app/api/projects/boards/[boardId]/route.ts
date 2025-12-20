import { endpoint, ok } from "@/app/api/utils";
import { getBoardSections } from "@/app/services/board-sections";
import { ProjectBoard } from "@/app/types/ProjectBoard";
import { lastSeenAt } from "@/app/utils/entities";

export const GET = endpoint<{ boardId: string }>(async ({ params, userId }) => {
    const { boardId } = params;

    const sections = await getBoardSections(userId, boardId);

    const board: ProjectBoard = {
        id: boardId,
        sections: sections.map((s) => ({
            id: s.id,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
            title: s.title,
            position: s.position,
            items: s.items.map((item) => ({
                id: item.id,
                sectionId: item.parentId,
                title: item.title,
                position: item.position,
                isDone: item.isDone,
                checkItemsCount: item.checkItems.length,
                doneCheckItemsCount: item.checkItems.filter((ci) => ci.isDone).length,
                lastSeenAt: lastSeenAt(item),
            }))
        })),
    };

    return ok(board);
});