import * as boardItemsService from "@/app/services/board-items";

export async function createTestBoardItem(
userId: string,
sectionId: string,
position: number,
title: string = "Test Item"
) {
return await boardItemsService.createBoardItem(
`item-${crypto.randomUUID()}`,
title,
position,
userId,
sectionId
);
}
