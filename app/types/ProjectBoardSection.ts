import { SimpleProjectBoardItem } from "./ProjectBoardItem";

export type ProjectBoardSection = {
    id: string,
    title: string,
    position: number,
    items: Array<SimpleProjectBoardItem>,
    createdAt: number,
    updatedAt: number,
}