// @ts-nocheck

import { useEffect, useRef, useState } from "react";
import useDialog from "../../hooks/useDialog";
import { isNullOrWhiteSpace } from "../../utils/string";
import Board from "./Board";
import { confirm } from "../confirm";
import TextInputDialog from "../TextInputDialog";
import BoardItemDialog from "./BoardItemDialog";

export default function IntegratedBoard(props: {
    board: ProjectBoardDto,
    projectId: string,
}) {
    const sectionPositionRef = useRef<number>(0);
    const sectionIdRef = useRef<string>("");
    const addSectionDialogState = useDialog();
    const renameSectionDialogState = useDialog();
    const itemDialogState = useDialog();
    const [editedSectionTitle, setEditedSectionTitle] = useState<string>("");
    const [selectedItem, setSelectedItem] = useState({ id: "", sectionId: "" });
    const { mutate: addSection } = useAddSection(props.projectId, props.board.id);
    const { mutate: addItem } = useAddItem(props.projectId, props.board.id);
    const { mutateAsync: updateSectionPosition } = useUpdateSectionPosition(props.projectId, props.board.id);
    const { mutate: renameSection } = useRenameSection(props.projectId, props.board.id);
    const { mutateAsync: updateItemPosition } = useUpdateItemPosition(props.projectId, props.board.id);
    const { mutate: updateItem } = useUpdateItemFromBoard(props.projectId, props.board.id);
    const { mutateAsync: deleteSection } = useDeleteSection(props.projectId, props.board.id);

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
            sectionId: section.id,
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
                onToggleItemClick={(sectionId, itemId, isDone) => updateItem({ sectionId, itemId, isDone })} />

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
                    sectionId={selectedItem.sectionId}
                    itemId={selectedItem.id} />}
        </>
    );
}