"use client";

import { LuPencil, LuTextCursorInput, LuTrash } from "react-icons/lu";
import type { DialogState } from "@/app/types/DialogState";
import { confirm } from "@/app/components/confirm";
import ContentDialog from "@/app/components/ContentDialog";
import MarkdownPreviewer from "@/app/components/MarkdownPreviewer";
import { useEffect, useState } from "react";
import useDialog from "@/app/hooks/useDialog";
import TextInputDialog from "@/app/components/TextInputDialog";
import { cn } from "@/app/utils/tailwind";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import Checklist from "./Checklist";
import Checkbox from "@/app/components/input/Checkbox";
import Button from "@/app/components/input/Button";
import { useBoardItem, useDeleteItem, useUpdateItem } from "./hooks";
import { ProjectBoardItem } from "@/app/types/ProjectBoardItem";
import { SimpleProjectBoardCheckItem } from "@/app/types/ProjectBoardCheckItem";

export default function BoardItemDialog(props: {
    itemId: string,
    projectId: string,
    boardId: string,
    state: DialogState,
}) {
    const { data: item } = useBoardItem(props.boardId, props.itemId);
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
                    boardId={props.boardId}
                    itemId={props.itemId}
                    item={item} />}>
                <div
                    className="-mx-5 -mb-4 grid grid-rows-[auto_1fr] flex-1 overflow-hidden">
                    <Actions
                        className="mt-1 mb-2 mx-5"
                        boardId={props.boardId}
                        itemId={props.itemId}
                        dialogState={props.state}
                        descriptionEditable={descriptionEditable}
                        setDescriptionEditable={setDescriptionEditable}
                        item={item} />

                    <div
                        className="px-5 pb-4 pt-2 overflow-y-auto max-h-full thin-scrollbar">
                        <Description
                            projectId={props.projectId}
                            boardId={props.boardId}
                            itemId={props.itemId}
                            descriptionEditable={descriptionEditable}
                            setDescriptionEditable={setDescriptionEditable}
                            item={item} />
                        <ChecklistSection
                            itemId={props.itemId}
                            checkItems={item?.checkItems || []}
                            disabled={!item} />
                    </div>
                </div>
        </ContentDialog>
    );
}

function Heading(props: {
    boardId: string,
    itemId: string,
    item: ProjectBoardItem | undefined,
}) {
    const { mutate: updateItem } = useUpdateItem(props.boardId, props.itemId);

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
                {props.item?.title || "Loading..."}
            </div>
        </div>
    );
}

function Actions(props: {
    className?: string,
    boardId: string,
    itemId: string,
    dialogState: DialogState,
    item: ProjectBoardItem | undefined,
    descriptionEditable: boolean,
    setDescriptionEditable: (value: boolean) => void,
}) {
    const isLarge = useMediaQuery("(width >= 30rem)");
    const { mutate: updateItem } = useUpdateItem(props.boardId, props.itemId);
    const { mutate: deleteItem } = useDeleteItem(props.boardId, props.itemId);
    const renameItemDialogState = useDialog();

    async function onRenameItemClick(title: string) {
        updateItem({ title });
        await renameItemDialogState.hide();
    }

    const descriptionButtonTitle = `${props.item?.description ? "Edit" : "Add"} description`;

    return (
        <>
            <div
                className={cn("flex gap-2", props.className)}>
                <Button
                    size="sm"
                    variant={isLarge ? "container" : "icon-container"}
                    title={isLarge ? undefined : descriptionButtonTitle}
                    onClick={() => props.setDescriptionEditable(true)}
                    disabled={props.descriptionEditable || !props.item}>
                    <LuPencil /> {isLarge && descriptionButtonTitle}
                </Button>
                <Button
                    size="sm"
                    variant={isLarge ? "container" : "icon-container"}
                    title={isLarge ? undefined : "Rename"}
                    onClick={renameItemDialogState.show}
                    disabled={!props.item}>
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
                    }}
                    disabled={!props.item}>
                    <LuTrash /> {isLarge && "Remove"}
                </Button>
            </div>

            <TextInputDialog
                state={renameItemDialogState}
                acceptTitle="Rename"
                heading="Rename item"
                placeholder="Title"
                initialValue={props.item?.title}
                onAcceptClick={onRenameItemClick} />
        </>
    );
}

function Description(props: {
    className?: string,
    projectId: string,
    boardId: string,
    itemId: string,
    item: ProjectBoardItem | undefined,
    descriptionEditable: boolean,
    setDescriptionEditable: React.Dispatch<React.SetStateAction<boolean>>,
}) {
    const { isPending, mutate: updateItem } = useUpdateItem(props.boardId, props.itemId);

    if (!props.item) {
        return undefined;
    }

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
    itemId: string,
    checkItems: Array<SimpleProjectBoardCheckItem>,
    disabled?: boolean,
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