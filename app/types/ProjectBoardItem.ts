import { SimpleProjectBoardCheckItem } from "./ProjectBoardCheckItem";

export type ProjectBoardItem = {
    id: string,
    sectionId: string,
    sectionTitle: string,
    title: string,
    description?: string,
    position: number,
    isDone: boolean,
    checkItems: Array<SimpleProjectBoardCheckItem>,
    createdAt: number,
    updatedAt: number,
    lastRequestedAt: number,
    lastSeenAt: number,
}

export type SimpleProjectBoardItem = {
    id: string,
    sectionId: string,
    title: string,
    position: number,
    isDone: boolean,
    checkItemsCount: number,
    doneCheckItemsCount: number,
    lastSeenAt: number,
}