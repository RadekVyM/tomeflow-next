"use client";

import { useEffect, useRef, useState } from "react";
import useDialog from "@/app/hooks/useDialog";
import { isNullOrWhiteSpace } from "@/app/utils/string";
import Board from "./Board";
import { confirm } from "@/app/components/confirm";
import TextInputDialog from "@/app/components/TextInputDialog";
import BoardItemDialog from "./BoardItemDialog";
import { useAddItem, useAddSection, useBoard, useDeleteSection, useRenameSection, useUpdateItemFromBoard, useUpdateItemPosition, useUpdateSectionPosition } from "./hooks";
import { ProjectBoard } from "@/app/types/ProjectBoard";
import BoardSkeleton from "./BoardSkeleton";

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
    const itemDialogState = useDialog();
    const [editedSectionTitle, setEditedSectionTitle] = useState<string>("");
    const [selectedItem, setSelectedItem] = useState({ id: "", sectionId: "" });
    const { mutate: addSection, isPending: isAddSectionPending } = useAddSection(props.board.id);
    const { mutate: addItem, isPending: isAddItemPending } = useAddItem(props.board.id);
    const { mutateAsync: updateSectionPosition, isPending: isUpdateSectionPositionPending } = useUpdateSectionPosition(props.board.id);
    const { mutate: renameSection, isPending: isRenameSectionPending } = useRenameSection(props.board.id);
    const { mutateAsync: updateItemPosition, isPending: isUpdateItemPositionPending } = useUpdateItemPosition(props.board.id);
    const { mutate: updateItem, isPending: isUpdateItemPending } = useUpdateItemFromBoard(props.board.id);
    const { mutateAsync: deleteSection, isPending: isDeleteSectionPending } = useDeleteSection(props.board.id);

    const isSyncing = isAddSectionPending ||
        isAddItemPending ||
        isUpdateSectionPositionPending ||
        isRenameSectionPending ||
        isUpdateItemPositionPending ||
        isUpdateItemPending ||
        isDeleteSectionPending;

    useEffect(() => {
        if (!itemDialogState.isOpen) {
            setSelectedItem({ id: "", sectionId: "" });
        }
    }, [itemDialogState.isOpen]);

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
                onItemClick={async (sectionId, itemId) => {
                    setSelectedItem({ id: itemId, sectionId });
                    await itemDialogState.show();
                }}
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

            {selectedItem.id !== "" && selectedItem.sectionId !== "" &&
                <BoardItemDialog
                    state={itemDialogState}
                    projectId={props.projectId}
                    boardId={props.board.id}
                    itemId={selectedItem.id} />}
        </>
    );
}