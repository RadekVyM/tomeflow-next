"use client";

import { fetchDelete, fetchPost, fetchPut } from "@/app/services/client/fetch";
import { ProjectBoard } from "@/app/types/ProjectBoard";
import { SimpleProjectBoardCheckItem } from "@/app/types/ProjectBoardCheckItem";
import { ProjectBoardItem } from "@/app/types/ProjectBoardItem";
import { isNullOrWhiteSpace } from "@/app/utils/string";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export function useAddSection(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { title: string, position: number }) =>
            fetchPost(`/api/projects/boards/${boardId}/sections`, data),
        onMutate: async () => await queryClient.cancelQueries({ queryKey: ["board", { boardId }] }),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
    });
}

export function useUpdateSectionPosition(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { position: number, sectionId: string }) => fetchPut(
            `/api/projects/board-sections/${data.sectionId}`,
            { position: data.position }),
        onMutate: async () => await queryClient.cancelQueries({ queryKey: ["board", { boardId }] }),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
    });
}

export function useRenameSection(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { sectionId: string, title: string }) => fetchPut(
            `/api/projects/board-sections/${data.sectionId}`,
            { title: data.title }),
        onMutate: async () => await queryClient.cancelQueries({ queryKey: ["board", { boardId }] }),
        // TODO: This could be optimized
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
    });
}

export function useDeleteSection(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { sectionId: string }) => fetchDelete(
            `/api/projects/board-sections/${data.sectionId}`),
        onMutate: async () => await queryClient.cancelQueries({ queryKey: ["board", { boardId }] }),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
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
                queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => updatedBoard(old, item));
                return item;
            }),
        enabled: !isNullOrWhiteSpace(boardId) && !isNullOrWhiteSpace(itemId),
    });
}

export function useAddItem(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { title: string, position: number, sectionId: string }) =>
            fetchPost(`/api/projects/board-sections/${data.sectionId}/items`, data),
        onMutate: async () => await queryClient.cancelQueries({ queryKey: ["board", { boardId }] }),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
    });
}

export function useUpdateItem(boardId: string, itemId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { title?: string, description?: string, isDone?: boolean }) =>
            fetchPut(`/api/projects/board-items/${itemId}`, data)
                .then((res) => res.json())
                .then((data) => data as ProjectBoardItem),
        onMutate: async () => await queryClient.cancelQueries({ queryKey: ["board-item", { itemId }] }),
        onSuccess: (data) => {
            queryClient.setQueryData(["board-item", { itemId }], data);
            queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => updatedBoard(old, data));
        },
    });
}

export function useUpdateItemFromBoard(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { itemId: string, isDone?: boolean }) =>
            fetchPut(
                `/api/projects/board-items/${data.itemId}`,
                {
                    isDone: data.isDone,
                })
                .then((res) => res.json())
                .then((data) => data as ProjectBoardItem),
        onSuccess: (data) => queryClient.setQueryData(["board", { boardId }], (old: ProjectBoard) => updatedBoard(old, data)),
    });
}

export function useUpdateItemPosition(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { position: number, itemId: string, targetSectionId: string }) =>
            fetchPut(
                `/api/projects/board-items/${data.itemId}`,
                {
                    position: data.position,
                    sectionId: data.targetSectionId,
                }),
        onMutate: async () => await queryClient.cancelQueries({ queryKey: ["board", { boardId }] }),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
    });
}

export function useDeleteItem(boardId: string, itemId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => fetchDelete(
            `/api/projects/board-items/${itemId}`),
        onMutate: async () => {
            await Promise.all([
                queryClient.cancelQueries({ queryKey: ["board", { boardId }] }),
                queryClient.cancelQueries({ queryKey: ["board-item", { itemId }] }),
            ]);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
    });
}

export function useAddCheckItem(boardId: string, itemId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { title: string, position: number }) =>
            fetchPost(`/api/projects/board-items/${itemId}/check-items`, data),
        onMutate: async () => await queryClient.cancelQueries({ queryKey: ["board-item", { itemId }] }),
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["board-item", { itemId }] }),
                queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
            ]);
        },
    });
}

export function useUpdateCheckItem(itemId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { position?: number, title?: string, isDone?: boolean, checkItemId: string }) => fetchPut(
            `/api/projects/board-check-items/${data.checkItemId}`,
            { position: data.position, isDone: data.isDone, title: data.title }),
        onMutate: async () => await queryClient.cancelQueries({ queryKey: ["board-item", { itemId }] }),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["board-item", { itemId }] }),
    });
}

export function useDeleteCheckItem(boardId: string, itemId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (checkItemId: string) => fetchDelete(
            `/api/projects/board-check-items/${checkItemId}`),
        onMutate: async () => await queryClient.cancelQueries({ queryKey: ["board-item", { itemId }] }),
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["board-item", { itemId }] }),
                queryClient.invalidateQueries({ queryKey: ["board", { boardId }] }),
            ]);
        },
    });
}

function updatedBoard(old: ProjectBoard, newItem: ProjectBoardItem) {
    for (let sectionIndex = 0; sectionIndex < old.sections.length; sectionIndex++) {
        const section = old.sections[sectionIndex];

        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
            const item = section.items[itemIndex];

            if (item.id === newItem.id) {
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
                    title: newItem.title,
                    lastSeenAt: newItem.lastSeenAt,
                    isDone: newItem.isDone,
                    checkItemsCount: newItem.checkItems.length,
                    doneCheckItemsCount: newItem.checkItems.filter((i) => i.isDone).length,
                };

                return newBoard;
            }
        }
    }

    return old;
}