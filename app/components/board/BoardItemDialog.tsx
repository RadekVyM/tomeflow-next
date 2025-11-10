// @ts-nocheck

import { LuPencil, LuTextCursorInput, LuTrash } from "react-icons/lu";
import type { DialogState } from "../../types/DialogState";
import { confirm } from "../confirm";
import ContentDialog from "../ContentDialog";
import MarkdownPreviewer from "../MarkdownPreviewer";
import { useBoardItem, useDeleteItem, useUpdateItem } from "./hooks";
import { useEffect, useState } from "react";
import useDialog from "../../hooks/useDialog";
import TextInputDialog from "../TextInputDialog";
import { isNullOrWhiteSpace } from "../../utils/string";
import { cn } from "../../utils/tailwind";
import useMediaQuery from "../../hooks/useMediaQuery";
import Checklist from "./Checklist";
import Checkbox from "../input/Checkbox";
import Button from "../input/Button";

export default function BoardItemDialog(props: {
    itemId: string,
    sectionId: string,
    projectId: string,
    boardId: string,
    state: DialogState,
}) {
    const { data: item } = useBoardItem(props.projectId, props.boardId, props.sectionId, props.itemId);
    const [descriptionEditable, setDescriptionEditable] = useState(false);

    useEffect(() => {
        if (props.state.isOpen) {
            setDescriptionEditable(false);
        }
    }, [props.state.isOpen]);

    return (
        <ContentDialog
            ref={props.state.dialogRef}
            className="max-w-4xl overflow-hidden max-h-full"
            state={props.state}
            heading={
                <Heading
                    projectId={props.projectId}
                    boardId={props.boardId}
                    sectionId={props.sectionId}
                    itemId={props.itemId}
                    item={item} />}
            notHideOnSubsequentLoads>
            {item &&
                <div
                    className="-mx-5 -mb-4 grid grid-rows-[auto_1fr] flex-1 overflow-hidden">
                    <Actions
                        className="mt-1 mb-2 mx-5"
                        projectId={props.projectId}
                        boardId={props.boardId}
                        sectionId={props.sectionId}
                        itemId={props.itemId}
                        dialogState={props.state}
                        descriptionEditable={descriptionEditable}
                        setDescriptionEditable={setDescriptionEditable}
                        item={item} />

                    <div
                        className="px-5 pb-4 overflow-y-auto max-h-full thin-scrollbar">
                        <Description
                            className="pt-2"
                            projectId={props.projectId}
                            boardId={props.boardId}
                            sectionId={props.sectionId}
                            itemId={props.itemId}
                            descriptionEditable={descriptionEditable}
                            setDescriptionEditable={setDescriptionEditable}
                            item={item} />
                        <ChecklistSection
                            projectId={props.projectId}
                            boardId={props.boardId}
                            sectionId={props.sectionId}
                            itemId={props.itemId}
                            checkItems={item.checkItems} />
                    </div>
                </div>}
        </ContentDialog>
    );
}

function Heading(props: {
    projectId: string,
    boardId: string,
    sectionId: string,
    itemId: string,
    item: ProjectBoardItemDto | undefined,
}) {
    const { mutate: updateItem } = useUpdateItem(props.projectId, props.boardId, props.sectionId, props.itemId);

    return (
        <div
            className="flex items-start gap-1.5 -ml-1">
            <Checkbox
                disabled={!props.item}
                title={props.item?.isDone ? "Mark incomplete" : "Mark complete"}
                checked={!!props.item?.isDone}
                onClick={() => props.item && updateItem({ isDone: !props.item.isDone })} />
            <div
                className="mt-[0.5px]">
                {props.item?.title}
            </div>
        </div>
    );
}

function Actions(props: {
    className?: string,
    projectId: string,
    boardId: string,
    sectionId: string,
    itemId: string,
    dialogState: DialogState,
    item: ProjectBoardItemDto,
    descriptionEditable: boolean,
    setDescriptionEditable: (value: boolean) => void,
}) {
    const isLarge = useMediaQuery("(width >= 30rem)");
    const { mutate: updateItem } = useUpdateItem(props.projectId, props.boardId, props.sectionId, props.itemId);
    const { mutate: deleteItem } = useDeleteItem(props.projectId, props.boardId, props.sectionId, props.itemId);
    const renameItemDialogState = useDialog();

    async function onRenameItemClick(title: string) {
        if (isNullOrWhiteSpace(title)) {
            return;
        }

        updateItem({ title });
        await renameItemDialogState.hide();
    }

    const descriptionButtonTitle = `${props.item.description ? "Edit" : "Add"} description`;

    return (
        <>
            <div
                className={cn("flex gap-2", props.className)}>
                <Button
                    size="sm"
                    variant={isLarge ? "container" : "icon-container"}
                    title={isLarge ? undefined : descriptionButtonTitle}
                    onClick={() => props.setDescriptionEditable(true)}
                    disabled={props.descriptionEditable}>
                    <LuPencil /> {isLarge && descriptionButtonTitle}
                </Button>
                <Button
                    size="sm"
                    variant={isLarge ? "container" : "icon-container"}
                    title={isLarge ? undefined : "Rename"}
                    onClick={renameItemDialogState.show}>
                    <LuTextCursorInput /> {isLarge && "Rename"}
                </Button>
                <Button
                    size="sm"
                    variant={isLarge ? "container" : "icon-container"}
                    title={isLarge ? undefined : "Remove"}
                    className="text-danger"
                    onClick={async () => {
                        if (!await confirm("Remove item", undefined, undefined, true)) {
                            return;
                        }

                        deleteItem();

                        await props.dialogState.hide();
                    }}>
                    <LuTrash /> {isLarge && "Remove"}
                </Button>
            </div>

            <TextInputDialog
                state={renameItemDialogState}
                acceptTitle="Rename"
                heading="Rename item"
                placeholder="Title"
                initialValue={props.item.title}
                onAcceptClick={onRenameItemClick} />
        </>
    );
}

function Description(props: {
    className?: string,
    projectId: string,
    boardId: string,
    sectionId: string,
    itemId: string,
    item: ProjectBoardItemDto,
    descriptionEditable: boolean,
    setDescriptionEditable: React.Dispatch<React.SetStateAction<boolean>>,
}) {
    const { isPending, mutate: updateItem } = useUpdateItem(props.projectId, props.boardId, props.sectionId, props.itemId);

    return (
        <MarkdownPreviewer
            editButtonHidden
            className={props.className}
            isSavePending={isPending}
            editorType="editor-first"
            projectId={props.projectId}
            text={props.item.description}
            onSave={(text) => updateItem({ description: text })}
            editable={props.descriptionEditable}
            setEditable={props.setDescriptionEditable} />
    );
}

function ChecklistSection(props: {
    projectId: string,
    boardId: string,
    sectionId: string,
    itemId: string,
    checkItems: Array<SimpleProjectBoardCheckItemDto>,
}) {
    return (
        <>
            <h3
                className="mb-1 text-lg font-semibold">
                Checklist
            </h3>
            <Checklist
                {...props} />
        </>
    );
}