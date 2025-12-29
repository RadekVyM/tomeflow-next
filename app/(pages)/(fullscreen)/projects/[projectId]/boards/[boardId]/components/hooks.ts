"use client";

import toast from "@/app/components/toast";
import { fetchDelete, fetchPost, fetchPut } from "@/app/services/client/fetch";
import { ProjectBoard } from "@/app/types/ProjectBoard";
import { ProjectBoardItem } from "@/app/types/ProjectBoardItem";
import { SimpleProjectBoardSection } from "@/app/types/ProjectBoardSection";
import { isNullOrWhiteSpace } from "@/app/utils/string";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBoard(boardId: string) {
    return useQuery({
        queryKey: ["board", { boardId }],
        queryFn: () => fetch(`/api/projects/boards/${boardId}`)
            .then((res) => res.json())
            .then((data) => data as ProjectBoard),
    });
}

export function useInvalidateBoard(boardId: string) {
    const queryClient = useQueryClient();

    return async () => await queryClient.invalidateQueries({ queryKey: ["board", { boardId }] });
}

export function useSections(boardId: string) {
    return useQuery({
        queryKey: ["board-sections", { boardId }],
        queryFn: () => fetch(`/api/projects/boards/${boardId}/sections`)
            .then((res) => res.json())
            .then((data) => {
                const sections = data as Array<SimpleProjectBoardSection>;

                sections.sort((a, b) => a.position - b.position);

                return sections;
            }),
    });
}

export function useAddSection(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { title: string, position: number }) => {
            const id = crypto.randomUUID();

            optimisticAddSection(queryClient, boardId, id, data.title, data.position);

            await queryClient.cancelQueries({ queryKey: ["board", { boardId }] });
            await fetchPost(`/api/projects/boards/${boardId}/sections`, {
                id,
                ...data,
            });
        },
        onError: () => toast("Failed to add a new section"),
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: ["board", { boardId }] });
            await queryClient.invalidateQueries({ queryKey: ["board-sections", { boardId }] });
        },
    });
}

export function useUpdateSectionPosition(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { position: number, sectionId: string }) => {
            optimisticUpdateSectionPosition(queryClient, boardId, data.sectionId, data.position);

            await queryClient.cancelQueries({ queryKey: ["board", { boardId }] });
            await fetchPut(
                `/api/projects/board-sections/${data.sectionId}`,
                { position: data.position });
        },
        onError: () => toast("Failed to update the section position"),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
    });
}

export function useRenameSection(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { sectionId: string, title: string }) => {
            optimisticRenameSection(queryClient, boardId, data.sectionId, data.title);

            await queryClient.cancelQueries({ queryKey: ["board", { boardId }] });
            await fetchPut(
                `/api/projects/board-sections/${data.sectionId}`,
                { title: data.title });
        },
        onError: () => toast("Failed to rename the section"),
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: ["board", { boardId }] });
            await queryClient.invalidateQueries({ queryKey: ["board-sections", { boardId }] });
        },
    });
}

export function useDeleteSection(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { sectionId: string }) => {
            optimisticDeleteSection(queryClient, boardId, data.sectionId);

            await queryClient.cancelQueries({ queryKey: ["board", { boardId }] });
            await fetchDelete(`/api/projects/board-sections/${data.sectionId}`);
        },
        onError: () => toast("Failed to delete the section"),
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: ["board", { boardId }] });
            await queryClient.invalidateQueries({ queryKey: ["board-sections", { boardId }] });
        },
    });
}

export function useBoardItem(boardId: string, itemId: string) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ["board-item", { itemId }],
        queryFn: () => fetch(`/api/projects/board-items/${itemId}`)
            .then((res) => res.json())
            .then((data) => {
                const item = data as ProjectBoardItem;
                queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => updatedBoardWithItem(old, data.id, item));
                return item;
            }),
        enabled: !isNullOrWhiteSpace(boardId) && !isNullOrWhiteSpace(itemId),
    });
}

export function useAddItem(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { title: string, position: number, sectionId: string }) => {
            const id = crypto.randomUUID();

            optimisticAddItem(queryClient, boardId, data.sectionId, id, data.title, data.position);

            await queryClient.cancelQueries({ queryKey: ["board", { boardId }] })
            await fetchPost(`/api/projects/board-sections/${data.sectionId}/items`, {
                id,
                ...data,
            });
        },
        onError: () => toast("Failed to add a new item"),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
    });
}

export function useUpdateItem(boardId: string, itemId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { title?: string, description?: string, isDone?: boolean }) => {
            queryClient.setQueryData(["board-item", { itemId }], (old: ProjectBoardItem) => ({
                ...old,
                title: data.title !== undefined ? data.title : old.title,
                description: data.description !== undefined ? data.description : old.description,
                isDone: data.isDone !== undefined ? data.isDone : old.isDone,
            }));
            queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => updatedBoardWithItem(old, itemId, data));

            await queryClient.cancelQueries({ queryKey: ["board-item", { itemId }] });
            return await fetchPut(`/api/projects/board-items/${itemId}`, data)
                .then((res) => res.json())
                .then((data) => data as ProjectBoardItem);
        },
        onError: () => toast("Failed to update the item"),
        onSuccess: (data) => {
            queryClient.setQueryData(["board-item", { itemId }], data);
            queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => updatedBoardWithItem(old, data.id, data));
        },
    });
}

export function useUpdateItemFromBoard(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { itemId: string, isDone?: boolean }) => {
            queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => updatedBoardWithItem(old, data.itemId, data));

            return await fetchPut(
                `/api/projects/board-items/${data.itemId}`,
                {
                    isDone: data.isDone,
                })
                .then((res) => res.json())
                .then((data) => data as ProjectBoardItem);
        },
        onError: () => toast("Failed to update the item"),
        onSuccess: (data) => queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => updatedBoardWithItem(old, data.id, data)),
    });
}

export function useUpdateItemPosition(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { position: number, itemId: string, targetSectionId: string }) => {
            optimisticUpdateItemPosition(queryClient, boardId, data.itemId, data.position, data.targetSectionId);

            await queryClient.cancelQueries({ queryKey: ["board", { boardId }] });
            await fetchPut(
                `/api/projects/board-items/${data.itemId}`,
                {
                    position: data.position,
                    sectionId: data.targetSectionId,
                });
            await queryClient.invalidateQueries({ queryKey: ["board-item", { itemId: data.itemId }] });
        },
        onError: () => toast("Failed to update the item position"),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
    });
}

export function useDeleteItem(boardId: string, itemId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            optimisticDeleteItem(queryClient, boardId, itemId);

            await Promise.all([
                queryClient.cancelQueries({ queryKey: ["board", { boardId }] }),
                queryClient.cancelQueries({ queryKey: ["board-item", { itemId }] }),
            ]);

            await fetchDelete(`/api/projects/board-items/${itemId}`);
        },
        onError: () => toast("Failed to delete the item"),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
    });
}

export function useAddCheckItem(itemId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { title: string, position: number }) => {
            const id = crypto.randomUUID();

            optimisticAddCheckItem(queryClient, itemId, id, data.title, data.position);

            await queryClient.cancelQueries({ queryKey: ["board-item", { itemId }] });
            await fetchPost(`/api/projects/board-items/${itemId}/check-items`, {
                id,
                ...data,
            });
        },
        onError: () => toast("Failed to add a new item to the checklist"),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board-item", { itemId }] }),
    });
}

export function useUpdateCheckItem(itemId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { checkItemId: string, position?: number, title?: string, isDone?: boolean, }) => {
            optimisticUpdateCheckItem(queryClient, itemId, data.checkItemId, data);

            await queryClient.cancelQueries({ queryKey: ["board-item", { itemId }] });
            await fetchPut(
                `/api/projects/board-check-items/${data.checkItemId}`,
                { position: data.position, isDone: data.isDone, title: data.title });
        },
        onError: () => toast("Failed to update the item"),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board-item", { itemId }] }),
    });
}

export function useDeleteCheckItem(itemId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (checkItemId: string) => {
            optimisticDeleteCheckItem(queryClient, itemId, checkItemId);

            await queryClient.cancelQueries({ queryKey: ["board-item", { itemId }] });
            await fetchDelete(`/api/projects/board-check-items/${checkItemId}`);
        },
        onError: () => toast("Failed to delete the item"),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board-item", { itemId }] }),
    });
}

function optimisticAddSection(queryClient: QueryClient, boardId: string, sectionId: string, title: string, position: number) {
    queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => {
        const now = Date.now();

        return {
            ...old,
            sections: [
                ...old.sections,
                {
                    id: sectionId,
                    position: position,
                    title: title,
                    items: [],
                    createdAt: now,
                    updatedAt: now,
                }
            ],
        };
    });
}

function optimisticUpdateSectionPosition(queryClient: QueryClient, boardId: string, sectionId: string, position: number) {
    queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => {
        const sections = [...old.sections];

        sections.sort((a, b) => a.position - b.position);

        const oldPosition = sections.findIndex((section) => section.id === sectionId);
        const sectionToMove = sections.splice(oldPosition, 1)[0];
        sections.splice(position, 0, sectionToMove);

        return {
            ...old,
            sections: sections.map((section, i) => ({
                ...section,
                position: i,
            })),
        };
    });
}

function optimisticRenameSection(queryClient: QueryClient, boardId: string, sectionId: string, title: string) {
    queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => {
        const sections = [...old.sections];

        const oldPosition = sections.findIndex((section) => section.id === sectionId);
        const section = sections[oldPosition];

        sections[oldPosition] = {
            ...section,
            title,
        };

        return {
            ...old,
            sections,
        };
    });
}

function optimisticDeleteSection(queryClient: QueryClient, boardId: string, sectionId: string) {
    queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => {
        const sections = old.sections.filter((section) => section.id !== sectionId);
        sections.sort((a, b) => a.position - b.position);

        return {
            ...old,
            sections: sections.map((section, i) => ({ ...section, position: i, })),
        };
    });
}

function optimisticAddItem(queryClient: QueryClient, boardId: string, sectionId: string, itemId: string, title: string, position: number) {
    queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => {
        const now = Date.now();
        const sections = [...old.sections];

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];

            if (section.id === sectionId) {
                sections[i] = {
                    ...section,
                    items: [
                        ...section.items,
                        {
                            id: itemId,
                            isDone: false,
                            title: title,
                            position: position,
                            sectionId: sectionId,
                            checkItemsCount: 0,
                            doneCheckItemsCount: 0,
                            lastSeenAt: now,
                        }
                    ],
                };
                break;
            }
        }

        return {
            ...old,
            sections,
        };
    });
}

function optimisticUpdateItemPosition(queryClient: QueryClient, boardId: string, itemId: string, position: number, targetSectionId: string) {
    queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => {
        const sections = [...old.sections];

        const currentSectionIndex = sections.findIndex((s) => s.items.find((i) => i.id === itemId));
        const currentSection = sections[currentSectionIndex] = { ...sections[currentSectionIndex] };
        const oldPosition = currentSection.items.findIndex((item) => item.id === itemId);
        const itemToMove = currentSection.items.splice(oldPosition, 1)[0];
        currentSection.items.sort((a, b) => a.position - b.position);

        if (targetSectionId === sections[currentSectionIndex].id) {
            if (itemToMove) {
                currentSection.items.splice(position, 0, itemToMove);
            }

            currentSection.items = currentSection.items.map((item, i) => ({
                ...item,
                position: i,
            }));

            return {
                ...old,
                sections,
            };
        }

        const targetSectionIndex = sections.findIndex((s) => s.id === targetSectionId);
        const targetSection = sections[targetSectionIndex] = { ...sections[targetSectionIndex] };

        targetSection.items = [...targetSection.items];
        targetSection.items.sort((a, b) => a.position - b.position);
        if (itemToMove) {
            targetSection.items.splice(position, 0, itemToMove);
        }

        currentSection.items = currentSection.items.map((item, i) => ({
            ...item,
            position: i,
        }));

        targetSection.items = targetSection.items.map((item, i) => ({
            ...item,
            position: i,
        }));

        return {
            ...old,
            sections,
        };
    });
}

function optimisticDeleteItem(queryClient: QueryClient, boardId: string, itemId: string) {
    queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => {
        const sections = [...old.sections];

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];

            if (section.items.find((item) => item.id === itemId)) {
                const items = section.items.filter((item) => item.id !== itemId);
                items.sort((a, b) => a.position - b.position);

                sections[i] = {
                    ...section,
                    items: items.map((item, i) => ({ ...item, position: i, })),
                };
                break;
            }
        }

        return {
            ...old,
            sections,
        };
    });
}

function optimisticAddCheckItem(queryClient: QueryClient, itemId: string, checkItemId: string, title: string, position: number) {
    queryClient.setQueryData(["board-item", { itemId }], (old: ProjectBoardItem) => {
        const result: ProjectBoardItem = {
            ...old,
            checkItems: [
                ...old.checkItems,
                {
                    id: checkItemId,
                    position: position,
                    title: title,
                    isDone: false,
                    itemId: itemId,
                }
            ],
        };

        return result;
    });
}

function optimisticUpdateCheckItem(
    queryClient: QueryClient,
    itemId: string,
    checkItemId: string,
    data: { position?: number, title?: string, isDone?: boolean, },
) {
    queryClient.setQueryData(["board-item", { itemId }], (old: ProjectBoardItem) => {
        const checkItems = [...old.checkItems];
        checkItems.sort((a, b) => a.position - b.position);
        const oldPosition = checkItems.findIndex((item) => item.id === checkItemId);
        checkItems[oldPosition] = { ...checkItems[oldPosition], ...data };

        if (data.position !== undefined) {

            const checkItemToMove = checkItems.splice(oldPosition, 1)[0];
            checkItems.splice(data.position, 0, checkItemToMove);
        }

        return {
            ...old,
            checkItems: checkItems.map((checkItem, i) => ({
                ...checkItem,
                position: i,
            })),
        };
    });
}

function optimisticDeleteCheckItem(queryClient: QueryClient, itemId: string, checkItemId: string) {
    queryClient.setQueryData(["board-item", { itemId }], (old: ProjectBoardItem) => {
        const checkItems = old.checkItems.filter((item) => item.id !== checkItemId);
        checkItems.sort((a, b) => a.position - b.position);

        return {
            ...old,
            checkItems: checkItems.map((item, i) => ({ ...item, position: i, })),
        };
    });
}

function updatedBoardWithItem(old: ProjectBoard, itemId: string, newItem: ProjectBoardItem | { title?: string, description?: string, isDone?: boolean }) {
    for (let sectionIndex = 0; sectionIndex < old.sections.length; sectionIndex++) {
        const section = old.sections[sectionIndex];

        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
            const item = section.items[itemIndex];

            if (item.id === itemId) {
                const newBoard: ProjectBoard = {
                    ...old,
                    sections: [...old.sections],
                };
                newBoard.sections[sectionIndex] = {
                    ...section,
                    items: [...section.items],
                };
                newBoard.sections[sectionIndex].items[itemIndex] = {
                    ...item,
                    title: newItem.title !== undefined ? newItem.title : item.title,
                    lastSeenAt: "lastSeenAt" in newItem ? newItem.lastSeenAt : item.lastSeenAt,
                    isDone: newItem.isDone !== undefined ? newItem.isDone : item.isDone,
                    checkItemsCount: "checkItems" in newItem ?
                        newItem.checkItems.length :
                        item.checkItemsCount,
                    doneCheckItemsCount: "checkItems" in newItem ?
                        newItem.checkItems.filter((i) => i.isDone).length :
                        item.doneCheckItemsCount,
                };

                return newBoard;
            }
        }
    }

    return old;
}