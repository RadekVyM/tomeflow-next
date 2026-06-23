import * as boardCheckItemsService from "@/app/services/board-check-items";

export async function createTestBoardCheckItem(
    userId: string,
    itemId: string,
    position: number,
    title: string = "Test Check Item"
) {
    return await boardCheckItemsService.createBoardCheckItem(
        `check-item-${crypto.randomUUID()}`,
        title,
        position,
        userId,
        itemId
    );
}