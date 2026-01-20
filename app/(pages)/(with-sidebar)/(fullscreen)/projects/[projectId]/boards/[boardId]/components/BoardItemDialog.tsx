"use client";

import { TbPencil, TbTrash } from "react-icons/tb";
import type { DialogState } from "@/app/types/DialogState";
import { confirm } from "@/app/components/confirm";
import ContentDialog from "@/app/components/ContentDialog";
import MarkdownPreviewer from "@/app/components/markdown/MarkdownPreviewer";
import { useEffect, useState } from "react";
import { cn } from "@/app/utils/tailwind";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import Checklist from "./Checklist";
import Checkbox from "@/app/components/input/Checkbox";
import Button from "@/app/components/input/Button";
import { useBoardItem, useDeleteItem, useUpdateItem } from "./hooks";
import { ProjectBoardItem } from "@/app/types/ProjectBoardItem";
import { SimpleProjectBoardCheckItem } from "@/app/types/ProjectBoardCheckItem";
import Skeleton from "@/app/components/skeleton/Skeleton";
import { isNullOrWhiteSpace } from "@/app/utils/string";
import BoardTextArea from "./BoardTextArea";
import MoveToSectionDialog from "./MoveToSectionDialog";
import useDialog from "@/app/hooks/useDialog";

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
            outerClassName="items-start py-10"
            className="max-w-4xl overflow-hidden max-h-full mt-0"
            state={props.state}
            heading={
                <Heading
                    boardId={props.boardId}
                    itemId={props.itemId}
                    item={item} />}
            headingContainerAs="div">
            <div
                className="-mx-5 -mb-4 grid grid-rows-[auto_1fr] flex-1 overflow-hidden">
                <div
                    className="mx-5 mt-1 mb-2 flex justify-between">
                    <SectionButton
                        boardId={props.boardId}
                        itemId={props.itemId}
                        item={item} />

                    <Actions
                        boardId={props.boardId}
                        itemId={props.itemId}
                        dialogState={props.state}
                        descriptionEditable={descriptionEditable}
                        setDescriptionEditable={setDescriptionEditable}
                        item={item} />
                </div>

                <div
                    className="px-5 pb-0 pt-2 overflow-y-auto max-h-full thin-scrollbar">
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
            className="flex items-start gap-1.5 -ml-1 mr-2">
            <Checkbox
                disabled={!props.item}
                title={props.item?.isDone ? "Mark incomplete" : "Mark complete"}
                checked={!!props.item?.isDone}
                onClick={() => props.item && updateItem({ isDone: !props.item.isDone })} />
            {props.item ?
                <EditableTitle
                    item={props.item}
                    changeTitle={(title) => updateItem({ title })} /> :
                <Skeleton
                    className="mt-[0.5px] w-60 max-w-full self-center"/>}
        </div>
    );
}

function EditableTitle(props: {
    item: ProjectBoardItem,
    changeTitle?: (title: string) => void,
}) {
    const [isEdited, setIsEdited] = useState(false);
    const [editedTitle, setEditedTitle] = useState(props.item?.title);

    useEffect(() => {
        setEditedTitle(props.item.title);
    }, [props.item.title, isEdited]);

    function saveChanges() {
        if (!isEdited) {
            return;
        }

        if (props.item.title !== editedTitle) {
            props.changeTitle?.(editedTitle);
        }
        setIsEdited(false);
    }

    if (!isEdited) {
        return (
            <Button
                className="-my-1 -ml-1 py-0.5 px-1.5 block wrap-anywhere max-w-full text-start"
                onClick={() => setIsEdited(true)}>
                <h2>{props.item.title}</h2>
            </Button>
        )
    }

    return (
        <form
            className="-mt-1 -mb-2 -ml-1 w-full"
            onBlur={(e) => {
                if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
                    saveChanges();
                }
            }}
            onSubmit={(e) => {
                e.preventDefault();
                saveChanges();
            }}>
            <BoardTextArea
                className="w-full py-0.5 px-1.5"
                placeholder="Title"
                value={editedTitle}
                onChange={setEditedTitle}
                focusOnDisplay />
        </form>
    );
}

function SectionButton(props: {
    boardId: string,
    itemId: string,
    item: ProjectBoardItem | undefined,
}) {
    const dialogState = useDialog();

    if (!props.item) {
        return (
            <Skeleton
                className="h-7 w-20 rounded-lg" />
        );
    }

    return (
        <>
            <Button
                variant="secondary"
                size="sm"
                title="Move to different section"
                onClick={dialogState.show}>
                {props.item.sectionTitle}
            </Button>

            <MoveToSectionDialog
                state={dialogState}
                itemId={props.itemId}
                boardId={props.boardId}
                currentSectionId={props.item.sectionId} />
        </>
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
    const isLarge = useMediaQuery("(width >= 40rem)");
    const { mutate: deleteItem } = useDeleteItem(props.boardId, props.itemId);

    const descriptionButtonTitle = `${props.item?.description ? "Edit" : "Add"} description`;

    return (
        <div
            className={cn("flex gap-2", props.className)}>
            <Button
                size="sm"
                variant="dynamic-container"
                title={isLarge ? undefined : descriptionButtonTitle}
                onClick={() => props.setDescriptionEditable(true)}
                disabled={props.descriptionEditable || !props.item}>
                <TbPencil /> <span>{descriptionButtonTitle}</span>
            </Button>
            <Button
                size="sm"
                variant="icon-container"
                title="Remove"
                className="text-danger"
                onClick={async () => {
                    if (!await confirm("Remove item", undefined, undefined, true)) {
                        return;
                    }

                    deleteItem();

                    await props.dialogState.hide();
                }}
                disabled={!props.item}>
                <TbTrash />
            </Button>
        </div>
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
            className={cn(
                props.className,
                (props.descriptionEditable || !isNullOrWhiteSpace(props.item.description)) && "my-2")}
            actionsWrapperClassName="bg-linear-to-t from-surface-container to-surface-container/0 from-10%"
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
                className="mb-4"
                {...props} />
        </>
    );
}