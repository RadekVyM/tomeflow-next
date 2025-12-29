"use client";

import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent, type UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { isNullOrWhiteSpace } from "@/app/utils/string";
import NewItemForm from "./NewItemForm";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import Handle from "./Handle";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { cn } from "@/app/utils/tailwind";
import { createPortal } from "react-dom";
import { LuEllipsisVertical, LuSave, LuTrash, LuX } from "react-icons/lu";
import BoardTextArea from "./BoardTextArea";
import DropDownButton from "@/app/components/input/DropdownButton";
import { confirm } from "@/app/components/confirm";
import Checkbox from "@/app/components/input/Checkbox";
import Button from "@/app/components/input/Button";
import { SimpleProjectBoardCheckItem } from "@/app/types/ProjectBoardCheckItem";
import { useAddCheckItem, useDeleteCheckItem, useUpdateCheckItem } from "./hooks";

type Item = {
    id: string,
    title: string,
    isDone: boolean,
    isEdited: boolean,
}

export default function Checklist(props: {
    className?: string,
    disabled?: boolean,
    itemId: string,
    checkItems: Array<SimpleProjectBoardCheckItem>,
}) {
    const { mutate: addItem } = useAddCheckItem(props.itemId);
    const { mutateAsync: updateCheckItem } = useUpdateCheckItem(props.itemId);
    const { mutateAsync: deleteCheckItem } = useDeleteCheckItem(props.itemId);

    async function moveCheckItem(checkItemId: string, position: number) {
        await updateCheckItem({
            position,
            checkItemId,
        });
    }

    async function toggleCheckItem(checkItemId: string, isDone: boolean) {
        await updateCheckItem({
            isDone,
            checkItemId,
        });
    }

    async function renameCheckItem(checkItemId: string, title: string) {
        await updateCheckItem({
            title,
            checkItemId,
        });
    }

    async function removeCheckItem(checkItemId: string) {
        if (!await confirm("Remove item", undefined, undefined, true)) {
            return;
        }

        await deleteCheckItem(checkItemId);
    }

    return (
        <div
            className={props.className}>
            <NewItemForm
                className="mb-2"
                placeholder="New item"
                submitTitle="Add item"
                onSubmit={(title) => {
                    if (isNullOrWhiteSpace(title)) {
                        return;
                    }

                    addItem({ title, position: props.checkItems.length, });
                }}
                disabled={props.disabled} />

            <SortableList
                checkItems={props.checkItems}
                disabled={props.disabled}
                moveCheckItem={moveCheckItem}
                toggleCheckItem={toggleCheckItem}
                renameCheckItem={renameCheckItem}
                removeCheckItem={removeCheckItem} />
        </div>
    );
}

function SortableList(props: {
    checkItems: Array<SimpleProjectBoardCheckItem>,
    disabled?: boolean,
    removeCheckItem: (checkItemId: string) => Promise<void>,
    moveCheckItem: (checkItemId: string, position: number) => Promise<void>,
    toggleCheckItem: (checkItemId: string, isDone: boolean) => Promise<void>,
    renameCheckItem: (checkItemId: string, title: string) => Promise<void>,
}) {
    const [items, setItems] = useState<Array<Item>>([]);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const isDraggingRef = useRef(false);

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        //useSensor(KeyboardSensor, { multipleContainersCoordinateGetter })
    );

    useEffect(() => {
        setItems(createItems(props.checkItems));
    }, [props.checkItems]);

    function onDragCancel() {
        if (isDraggingRef.current) {
            setItems(createItems(props.checkItems));
        }
        setActiveId(null);
        isDraggingRef.current = false;
    }

    function onDragStart(event: DragStartEvent) {
        setActiveId(event.active.id);
        isDraggingRef.current = true;
    }

    async function onDragEnd(event: DragEndEvent) {
        if (event.active.id !== event.over?.id) {
            const oldIndex = items.findIndex((i) => i.id === event.active.id);
            const overIndex = items.findIndex((i) => i.id === event.over?.id);

            setItems((items) => arrayMove(items, oldIndex, overIndex));

            await props.moveCheckItem(event.active.id.toString(), overIndex);
        }

        isDraggingRef.current = false;
        setActiveId(null);
    }

    function renderSortableItemDragOverlay(id: UniqueIdentifier) {
        const item = items.find((item) => item.id === id);

        if (!item) {
            return undefined;
        }

        return (
            <ItemContent
                id={id}
                item={item}
                isDragOverlay />
        );
    }

    const dialogs = document.querySelectorAll("dialog");
    const container = dialogs.length === 0 ?
        (document.fullscreenElement || document.body) :
        dialogs[dialogs.length - 1];

    return (
        <DndContext
            sensors={sensors}
            onDragCancel={onDragCancel}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}>
            <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}>
                <ul
                    className="flex flex-col gap-0.5">
                    {items.map((item) =>
                        <SortableItem
                            key={item.id}
                            item={item}
                            onRemoveClick={async () => await props.removeCheckItem(item.id)}
                            toggleIsDone={async (isDone) => await props.toggleCheckItem(item.id, isDone)}
                            changeTitle={async (title) => await props.renameCheckItem(item.id, title)}
                            toggleIsEdited={(isEdited) => setItems((old) => old.map((oldItem) => ({
                                ...oldItem,
                                isEdited: oldItem.id === item.id ? isEdited : false,
                            })))}
                            disabled={props.disabled} />)}
                </ul>
            </SortableContext>

            {createPortal(
                <DragOverlay>
                    {activeId && renderSortableItemDragOverlay(activeId)}
                </DragOverlay>, container)}
        </DndContext>
    );
}

function SortableItem(props: {
    item: Item,
    disabled?: boolean,
    onRemoveClick: () => void,
    toggleIsDone: (isDone: boolean) => void,
    toggleIsEdited: (isEdited: boolean) => void,
    changeTitle: (title: string) => void,
}) {
    const {
        setNodeRef,
        setActivatorNodeRef,
        listeners,
        isDragging,
        transform,
        transition,
    } = useSortable({
        id: props.item.id,
    });

    return (
        <ItemContent
            ref={props.disabled ? undefined : setNodeRef}
            id={props.item.id}
            item={props.item}
            className={cn(isDragging && "opacity-50 z-10")}
            style={{
                transition,
                transform: CSS.Translate.toString(transform),
            }}
            setActivatorNodeRef={setActivatorNodeRef}
            listeners={listeners}
            onRemoveClick={props.onRemoveClick}
            toggleIsDone={props.toggleIsDone}
            toggleIsEdited={props.toggleIsEdited}
            changeTitle={props.changeTitle} />
    );
}

function ItemContent(props: {
    ref?: React.RefCallback<HTMLLIElement>,
    className?: string,
    style?: React.CSSProperties,
    id: UniqueIdentifier,
    item: Item,
    disabled?: boolean,
    listeners?: SyntheticListenerMap,
    isDragOverlay?: boolean,
    setActivatorNodeRef?: (element: HTMLElement | null) => void,
    onRemoveClick?: () => void,
    toggleIsDone?: (isDone: boolean) => void,
    toggleIsEdited?: (isEdited: boolean) => void,
    changeTitle?: (title: string) => void,
}) {
    const [editedTitle, setEditedTitle] = useState(props.item.title);

    useEffect(() => {
        setEditedTitle(props.item.title);
    }, [props.item.title, props.item.isEdited]);

    return (
        <li
            ref={props.ref}
            className={cn("relative list-none grid grid-cols-[auto_1fr_auto_auto] items-start", props.className)}
            style={props.style}>
            <Checkbox
                className="mt-0.5"
                checked={props.item.isDone}
                onClick={() => props.toggleIsDone?.(!props.item.isDone)}
                disabled={props.disabled || props.item.isEdited} />
            {props.item.isEdited ?
                <form
                    className="mb-1 flex flex-col gap-1 -my-px"
                    onBlur={(e) => {
                        if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
                            props.toggleIsEdited?.(false);
                        }
                    }}
                    onSubmit={(e) => {
                        e.preventDefault();

                        if (!props.disabled && props.item.title !== editedTitle) {
                            props.changeTitle?.(editedTitle);
                        }
                    }}>
                    <BoardTextArea
                        className="w-full px-1.5"
                        placeholder="Title"
                        value={editedTitle}
                        onChange={setEditedTitle}
                        focusOnDisplay />
                    <div
                        className="flex gap-1">
                        <Button
                            size="sm"
                            variant="primary"
                            type="submit"
                            disabled={props.disabled || props.item.title === editedTitle}>
                            <LuSave /> Save
                        </Button>
                        <Button
                            size="sm"
                            variant="icon-container"
                            title="Cancel"
                            disabled={props.disabled}
                            onClick={() => props.toggleIsEdited?.(false)}>
                            <LuX />
                        </Button>
                    </div>
                </form> :
                <Button
                    className="py-0.5 px-1.5 w-full block wrap-anywhere max-w-full text-start"
                    onClick={() => props.toggleIsEdited?.(true)}>
                    {props.item.title}
                </Button>}
            <DropDownButton
                className="mt-0.5 ml-1"
                size="sm"
                id={`checkdrop-${props.item.id}`}
                icon={LuEllipsisVertical}
                title="Actions"
                variant="icon-default">
                {!props.isDragOverlay &&
                    <ul
                        className="flex flex-col items-stretch gap-1 p-1.5">
                        <li>
                            <Button
                                size="sm"
                                className="w-full text-danger"
                                disabled={props.disabled}
                                onClick={props.onRemoveClick}>
                                <LuTrash /> Remove item
                            </Button>
                        </li>
                    </ul>}
            </DropDownButton>
            <Handle
                className="mt-0.5"
                size="sm"
                disabled={props.disabled || props.item.isEdited}
                setActivatorNodeRef={props.setActivatorNodeRef}
                listeners={props.listeners}
                isDragging={props.isDragOverlay} />
        </li>
    );
}

function createItems(checkItems: Array<SimpleProjectBoardCheckItem>): Array<Item> {
    const items = [...checkItems];
    items.sort((a, b) => a.position - b.position);
    return items.map((item) => ({
        ...item,
        isEdited: false,
    }));
}