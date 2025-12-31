"use client";

import { useContext, useEffect, useRef, useState } from "react";
import useDialog from "@/app/hooks/useDialog";
import { isNullOrWhiteSpace } from "@/app/utils/string";
import Board from "./Board";
import { confirm } from "@/app/components/confirm";
import TextInputDialog from "@/app/components/TextInputDialog";
import BoardItemDialog from "./BoardItemDialog";
import { useAddItem, useAddSection, useBoard, useDeleteSection, useRenameSection, useUpdateItemFromBoard, useUpdateItemPosition, useUpdateSectionPosition } from "./hooks";
import { ProjectBoard } from "@/app/types/ProjectBoard";
import BoardSkeleton from "./BoardSkeleton";
import { BoardPageContext } from "./BoardPageContext";
import { useSearchParams } from "next/navigation";
import useIsClient from "@/app/hooks/useIsClient";

export default function IntegratedBoard(props: {
    boardId: string,
    projectId: string,
}) {
    const { data: board, error } = useBoard(props.boardId);

    if (!board) {
        return <BoardSkeleton />;
    }

    if (error) {
        return "Board could not be loaded.";
    }

    return (
        <IntegratedBoardInternal
            board={board}
            projectId={props.projectId} />
    );
}

function IntegratedBoardInternal(props: {
    board: ProjectBoard,
    projectId: string,
}) {
    const sectionPositionRef = useRef<number>(0);
    const sectionIdRef = useRef<string>("");
    const addSectionDialogState = useDialog();
    const renameSectionDialogState = useDialog();
    const [editedSectionTitle, setEditedSectionTitle] = useState<string>("");
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const { mutate: addSection, isPending: isAddSectionPending } = useAddSection(props.board.id);
    const { mutate: addItem, isPending: isAddItemPending } = useAddItem(props.board.id);
    const { mutateAsync: updateSectionPosition, isPending: isUpdateSectionPositionPending } = useUpdateSectionPosition(props.board.id);
    const { mutate: renameSection, isPending: isRenameSectionPending } = useRenameSection(props.board.id);
    const { mutateAsync: updateItemPosition, isPending: isUpdateItemPositionPending } = useUpdateItemPosition(props.board.id);
    const { mutate: updateItem, isPending: isUpdateItemPending } = useUpdateItemFromBoard(props.board.id);
    const { mutateAsync: deleteSection, isPending: isDeleteSectionPending } = useDeleteSection(props.board.id);
    const { setIsSyncing } = useContext(BoardPageContext);

    const isSyncing = isAddSectionPending ||
        isAddItemPending ||
        isUpdateSectionPositionPending ||
        isRenameSectionPending ||
        isUpdateItemPositionPending ||
        isUpdateItemPending ||
        isDeleteSectionPending;

    useEffect(() => setIsSyncing(isSyncing), [isSyncing]);

    async function moveSection(sectionId: string, position: number) {
        await updateSectionPosition({
            position,
            sectionId,
        });
    }

    async function moveItem(itemId: string, sectionId: string, position: number) {
        const section = props.board.sections.find((s) => s.items.some((i) => i.id === itemId));

        if (!section) {
            return;
        }

        await updateItemPosition({
            itemId,
            position,
            targetSectionId: sectionId,
        });
    }

    async function onAddSectionClick(title: string) {
        if (isNullOrWhiteSpace(title)) {
            return;
        }

        addSection({ title, position: sectionPositionRef.current });
        await addSectionDialogState.hide();
    }

    async function onRenameSectionClick(title: string) {
        if (isNullOrWhiteSpace(title)) {
            return;
        }

        renameSection({ sectionId: sectionIdRef.current, title });
        await renameSectionDialogState.hide();
    }

    async function showDialog(itemId: string) {
        setSelectedItemId(itemId);
    }

    return (
        <>
            <Board
                board={props.board}
                moveItem={moveItem}
                moveSection={moveSection}
                onItemSubmit={(position, sectionId, title) => {
                    if (isNullOrWhiteSpace(title)) {
                        return;
                    }

                    addItem({ title, position, sectionId });
                }}
                onAddSectionClick={async (position) => {
                    sectionPositionRef.current = position;
                    await addSectionDialogState.show();
                }}
                onRenameSectionClick={async (sectionId, title) => {
                    setEditedSectionTitle(title);
                    sectionIdRef.current = sectionId;
                    await renameSectionDialogState.show();
                }}
                onRemoveSectionClick={async (sectionId) => {
                    if (!await confirm("Remove section", undefined, undefined, true)) {
                        return;
                    }

                    deleteSection({ sectionId });
                }}
                onItemClick={showDialog}
                onToggleItemClick={(itemId, isDone) => updateItem({ itemId, isDone })} />

            <TextInputDialog
                state={addSectionDialogState}
                acceptTitle="Add section"
                heading="New section"
                placeholder="Title"
                onAcceptClick={onAddSectionClick} />

            <TextInputDialog
                state={renameSectionDialogState}
                acceptTitle="Rename"
                heading="Rename section"
                placeholder="Title"
                initialValue={editedSectionTitle}
                onAcceptClick={onRenameSectionClick} />

            <ItemDialog
                projectId={props.projectId}
                boardId={props.board.id}
                selectedItemId={selectedItemId}
                setSelectedItemId={setSelectedItemId} />
        </>
    );
}

function ItemDialog(props: {
    projectId: string,
    boardId: string,
    selectedItemId: string | null,
    setSelectedItemId: (value: string | null) => void,
}) {
    const isClient = useIsClient();
    const itemDialogState = useDialog();
    const searchParams = useSearchParams();
    const searchItemId = searchParams.get("itemId");

    useEffect(() => {
        if (isClient && searchItemId) {
            props.setSelectedItemId(searchItemId);
        }
    }, [isClient, searchItemId]);

    useEffect(() => {
        if (props.selectedItemId) {
            itemDialogState.show();
        }
    }, [props.selectedItemId]);

    useEffect(() => {
        if (!itemDialogState.isOpen) {
            props.setSelectedItemId(null);

            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, [itemDialogState.isOpen]);

    if (!isClient || !props.selectedItemId) {
        return undefined;
    }

    return (
        <BoardItemDialog
            state={itemDialogState}
            projectId={props.projectId}
            boardId={props.boardId}
            itemId={props.selectedItemId} />
    );
}