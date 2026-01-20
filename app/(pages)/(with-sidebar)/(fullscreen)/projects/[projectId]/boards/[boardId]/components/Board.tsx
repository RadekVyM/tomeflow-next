"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { closestCenter, DndContext, DragOverlay, getFirstCollision, MeasuringStrategy, MouseSensor, pointerWithin, rectIntersection, TouchSensor, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragOverEvent, type DragStartEvent, type UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove, defaultAnimateLayoutChanges, horizontalListSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy, type AnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { TbDotsVertical, TbSquareRoundedCheck, TbForms, TbTrash } from "react-icons/tb";
import { createPortal } from "react-dom";
import DropDownButton from "@/app/components/input/DropdownButton";
import { cn } from "@/app/utils/tailwind";
import Handle from "./Handle";
import Checkbox from "@/app/components/input/Checkbox";
import Button from "@/app/components/input/Button";
import { ProjectBoard } from "@/app/types/ProjectBoard";
import NewItemForm from "./NewItemForm";
import { SimpleProjectBoardItem } from "@/app/types/ProjectBoardItem";
import AddSectionButton from "./AddSectionButton";

// Based on:
// https://github.com/clauderic/dnd-kit/blob/master/stories/2%20-%20Presets/Sortable/MultipleContainers.tsx
// https://docs.dndkit.com/presets/sortable
// https://master--5fc05e08a4a65d0021ae0bf2.chromatic.com/?path=/docs/presets-sortable-multiple-containers--basic-setup#drag-handle

type Section = {
    id: string,
    title: string,
    items: Array<Item>,
}

type Item = {
    id: string,
    title: string,
    isDone: boolean,
    checkItemsCount: number,
    doneCheckItemsCount: number,
}

export default function Board(props: {
    board: ProjectBoard,
    isPending?: boolean,
    moveSection: (sectionId: string, position: number) => Promise<void>,
    moveItem: (itemId: string, sectionId: string, position: number) => Promise<void>,
    onAddSectionClick: (position: number) => void,
    onItemSubmit: (position: number, sectionId: string, title: string) => void,
    onRemoveSectionClick: (sectionId: string) => void,
    onRenameSectionClick: (sectionId: string, title: string) => void,
    onItemClick: (itemId: string) => void,
    onToggleItemClick: (itemId: string, isDone: boolean) => void,
}) {
    const [sections, setSections] = useState<Array<Section>>([]);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const recentlyMovedToNewContainerRef = useRef(false);
    const isDraggingRef = useRef(false);
    const isSortingContainer = activeId !== null ?
        props.board.sections.some((s) => s.id === activeId) :
        false;

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        //useSensor(KeyboardSensor, { multipleContainersCoordinateGetter })
    );
    const collisionDetectionStrategy = useCollisionDetectionStrategy(sections, activeId, recentlyMovedToNewContainerRef);

    useEffect(() => {
        setSections(createSections(props.board));

        requestAnimationFrame(() => {
            recentlyMovedToNewContainerRef.current = false;
        });
    }, [props.board]);

    function onAddSectionClick() {
        props.onAddSectionClick(props.board.sections.length);
    }

    function onDragCancel() {
        if (isDraggingRef.current) {
            setSections(createSections(props.board));
        }
        setActiveId(null);
        isDraggingRef.current = false;
    }

    function onDragStart(event: DragStartEvent) {
        setActiveId(event.active.id);
        isDraggingRef.current = true;
    }

    function onDragOver(event: DragOverEvent) {
        const overId = event.over?.id;
        const activeSectionId = findSectionId(sections, event.active.id);
        const overSectionId = overId ? findSectionId(sections, overId) : null;

        if (sections.some((s) => s.id === event.active.id) || !activeSectionId || !overSectionId || !overId || activeSectionId === overSectionId) {
            return;
        }

        const activeItems = findSectionItems(sections, activeSectionId)!;
        const overItems = findSectionItems(sections, overSectionId)!;

        setSections((prevState) => {
            const activeIndex = activeItems.findIndex((i) => i.id === event.active.id);
            const overIndex = overItems.findIndex((i) => i.id === overId);
            const newIndex = () => {
                const putOnBelowLastItem = overIndex === overItems.length - 1 && event.delta.y > 0;
                const modifier = putOnBelowLastItem ? 1 : 0;
                return overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            };

            return prevState.map((section) => {
                if (section.id === activeSectionId) {
                    section.items = activeItems.filter((i) => i.id !== event.active.id);
                    return section;
                }
                else if (section.id === overSectionId) {
                    section.items = [
                        ...overItems.slice(0, newIndex()),
                        activeItems[activeIndex],
                        ...overItems.slice(newIndex(), overItems.length)
                    ];
                    return section;
                }
                else {
                    return section;
                }
            });
        });
    }

    async function onDragEnd(event: DragEndEvent) {
        const overId = event.over?.id;
        const activeSectionId = findSectionId(sections, event.active.id);
        const overSectionId = overId ? findSectionId(sections, overId) : null;

        if (!activeSectionId || !overSectionId || !overId) {
            setActiveId(null);
            return;
        }

        if (sections.some((s) => s.id === event.active.id)) {
            // Optimistic update
            setSections((sections) => {
                const activeIndex = sections.findIndex((section) => section.id === event.active.id);
                const overIndex = sections.findIndex((section) => section.id === overId);

                return arrayMove(sections, activeIndex, overIndex);
            });

            setActiveId(null);
            isDraggingRef.current = false;

            if (activeSectionId !== overSectionId) {
                const overIndex = sections.findIndex((section) => section.id === overId);

                await props.moveSection(activeSectionId, overIndex);
            }
            return;
        }

        const overItemIndex = findSectionItems(sections, overSectionId)?.findIndex((item) => item.id === overId);

        setActiveId(null);
        isDraggingRef.current = false;

        if (overItemIndex !== undefined) {
            // Optimistic update
            setSections((sections) => {
                const activeItems = findSectionItems(sections, activeSectionId)!;
                const overItems = findSectionItems(sections, overSectionId)!;
                const activeIndex = activeItems.findIndex((i) => i.id === event.active.id);
                const overIndex = overItems.findIndex((i) => i.id === overId);

                return sections.map((section) => {
                    if (section.id === overSectionId) {
                        return {
                            ...section,
                            items: arrayMove(section.items, activeIndex, overIndex),
                        };
                    }
                    return { ...section };
                });
            });

            await props.moveItem(event.active.id.toString(), overSectionId, overItemIndex);
        }
    }

    function renderSortableItemDragOverlay(id: UniqueIdentifier) {
        const item = sections.flatMap((s) => s.items).find((item) => item.id === id);

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

    function renderContainerDragOverlay(containerId: UniqueIdentifier) {
        const section = sections.find((s) => s.id === containerId);

        if (!section) {
            return undefined;
        }

        return (
            <DroppableContainer
                id={containerId}
                title={section.title}
                items={section.items}
                isDragOverlay>
                {section.items.map((item) => 
                    <ItemContent
                        key={item.id}
                        id={item.id}
                        item={item} />)}
                {section.items.length === 0 &&
                    <NoItems />}
            </DroppableContainer>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            onDragCancel={onDragCancel}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            measuring={{
                droppable: {
                    strategy: MeasuringStrategy.Always,
                },
            }}>
            <div
                className="h-full w-fit pb-4 px-4 flex gap-3 isolate">
                <SortableContext
                    items={sections.map((i) => i.id)}
                    strategy={horizontalListSortingStrategy}>
                    {sections.map((section) =>
                        <DroppableContainer
                            key={section.id}
                            id={section.id}
                            title={section.title}
                            items={section.items}
                            onItemSubmit={(text) => props.onItemSubmit(section.items.length, section.id, text)}
                            onRemoveSectionClick={() => props.onRemoveSectionClick(section.id)}
                            onRenameSectionClick={() => props.onRenameSectionClick(section.id, section.title)}>
                            <SortableContext
                                items={section.items.map((i) => i.id)}
                                strategy={verticalListSortingStrategy}>
                                {section.items.map((item) => 
                                    <SortableItem
                                        key={item.id}
                                        id={item.id}
                                        item={item}
                                        onClick={() => props.onItemClick(item.id)}
                                        onCheckboxClick={() => props.onToggleItemClick(item.id, !item.isDone)} />)}
                                {section.items.length === 0 &&
                                    <NoItems />}
                            </SortableContext>
                        </DroppableContainer>)}

                    <AddSectionButton
                        onClick={onAddSectionClick} />
                </SortableContext>
            </div>

            {createPortal(
                <DragOverlay>
                    {activeId && (sections.some((s) => s.id === activeId) ?
                        renderContainerDragOverlay(activeId) :
                        renderSortableItemDragOverlay(activeId))}
                </DragOverlay>, document.body)}
        </DndContext>
    );
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({...args, wasDragging: true});

function NoItems() {
    return (
        <li
            className="flex-1 grid place-content-center text-sm text-on-surface-container-muted">
            No items
        </li>
    );
}

function DroppableContainer(props: {
    id: UniqueIdentifier,
    title?: string,
    items: Array<Item>,
    onRemoveSectionClick?: () => void,
    onRenameSectionClick?: () => void,
    onItemSubmit?: (text: string) => void,
    disabled?: boolean,
    isDragOverlay?: boolean,
    children?: React.ReactNode,
}) {
    const {
        active,
        attributes,
        isDragging,
        listeners,
        over,
        setNodeRef,
        transition,
        transform,
    } = useSortable({
        id: props.id,
        data: {
            type: "container",
            // children: items,
        },
        animateLayoutChanges,
    });
    const isOverContainer = over ?
        (props.id === over.id && active?.data.current?.type !== "container") || props.items.some((i) => i.id === over.id) :
        false;

    return (
        <article
            ref={props.isDragOverlay ? undefined : setNodeRef}
            className={cn(
                "grid grid-rows-[auto_1fr_auto] min-w-72 max-w-72 h-full border border-outline-variant rounded-2xl bg-surface-container",
                isOverContainer && "bg-surface-dim-container",
                isDragging && "z-10")}
            style={{
                transition: transition,
                transform: CSS.Translate.toString(transform),
                opacity: isDragging ? 0.5 : undefined,
            }}>
            <header
                className="flex items-start justify-between pl-4 pr-2 pt-2">
                <h3
                    className="text-lg font-semibold wrap-anywhere max-w-full line-clamp-2">
                    {props.title}
                </h3>

                <div
                    className="flex items-center gap-1">
                    <DropDownButton
                        id={`${props.id}-section-more-${props.isDragOverlay}`}
                        variant="icon-default"
                        title="Actions"
                        size="sm"
                        icon={TbDotsVertical}
                        disabled={props.isDragOverlay || props.disabled}>
                        {!props.isDragOverlay &&
                            <ul
                                className="flex flex-col items-stretch gap-1 p-1.5">
                                <li>
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={props.onRenameSectionClick}
                                        disabled={props.disabled}>
                                        <TbForms /> Rename section
                                    </Button>
                                </li>
                                <li>
                                    <Button
                                        size="sm"
                                        className="w-full text-danger"
                                        onClick={props.onRemoveSectionClick}
                                        disabled={props.disabled}>
                                        <TbTrash /> Remove section
                                    </Button>
                                </li>
                            </ul>}
                    </DropDownButton>

                    <Handle
                        attributes={attributes}
                        listeners={listeners}
                        disabled={props.disabled}
                        isDragging={props.isDragOverlay} />
                </div>
            </header>

            <ul
                className="py-2 flex flex-col gap-1 overflow-y-auto max-h-full thin-scrollbar">
                {props.children}
            </ul>

            <NewItemForm
                className="px-4 pt-2 pb-3"
                placeholder="New item"
                submitTitle="Add item"
                disabled={props.disabled}
                onSubmit={props.onItemSubmit} />
        </article>
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
    onClick?: () => void,
    onCheckboxClick?: () => void,
}) {
    return (
        <li
            ref={props.ref}
            className={cn("px-2 relative list-none", props.className)}
            style={props.style}>
            <Button
                className="px-2 py-1.5 w-full block wrap-anywhere max-w-full text-start pr-8"
                onClick={props.onClick}
                disabled={props.disabled}>
                <div
                    className="mt-[2px] ml-7 text-sm">
                    {props.item.title}
                </div>
                {props.item.checkItemsCount !== 0 &&
                    <div
                        className="flex items-center gap-1.5 mt-1">
                        <TbSquareRoundedCheck
                            className="text-primary dark:text-primary-dim" />
                        <span
                            className="text-sm text-primary dark:text-primary-dim mt-0.5">
                            {props.item.doneCheckItemsCount}/{props.item.checkItemsCount}
                        </span>
                    </div>}
            </Button>
            <Checkbox
                className="absolute top-1 left-3"
                title={props.item.isDone ? "Mark incomplete" : "Mark complete"}
                checked={props.item.isDone}
                onClick={props.onCheckboxClick}
                disabled={props.disabled} />
            <Handle
                className="absolute right-0 top-1/2 -translate-y-1/2 mr-2"
                size="sm"
                disabled={props.disabled}
                setActivatorNodeRef={props.setActivatorNodeRef}
                listeners={props.listeners}
                isDragging={props.isDragOverlay} />
        </li>
    );
}

function SortableItem(props: {
    id: UniqueIdentifier,
    item: Item,
    disabled?: boolean,
    onClick: () => void,
    onCheckboxClick: () => void,
}) {
    const {
        setNodeRef,
        setActivatorNodeRef,
        listeners,
        isDragging,
        transform,
        transition,
    } = useSortable({
        id: props.id,
    });

    return (
        <ItemContent
            ref={props.disabled ? undefined : setNodeRef}
            {...props}
            className={cn(isDragging && "opacity-50 z-10")}
            style={{
                transition,
                transform: CSS.Translate.toString(transform),
            }}
            setActivatorNodeRef={setActivatorNodeRef}
            listeners={listeners}
            disabled={props.disabled} />
    );
}

function useCollisionDetectionStrategy(
    sections: Array<Section>,
    activeId: UniqueIdentifier | null,
    recentlyMovedToNewContainer: React.RefObject<boolean>,
) {
    const lastOverId = useRef<UniqueIdentifier | null>(null);

    const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
        if (activeId && sections.some((s) => s.id === activeId)) {
            return closestCenter({
                ...args,
                droppableContainers: args.droppableContainers.filter((container) =>
                    sections.some((s) => s.id === container.id)),
            });
        }

        // Start by finding any intersecting droppable
        const pointerIntersections = pointerWithin(args);
        const intersections =
            pointerIntersections.length > 0
            ? // If there are droppables intersecting with the pointer, return those
                pointerIntersections
            : rectIntersection(args);
        let overId = getFirstCollision(intersections, "id");

        if (overId !== null) {
            const section = sections.find((s) => s.id === overId);

            if (section && section.items.length > 0) {
                // If a container is matched and it contains items (columns "A", "B", "C")
                // Return the closest droppable within that container
                overId = closestCenter({
                    ...args,
                    droppableContainers: args.droppableContainers.filter((container) =>
                        container.id !== overId && section.items.some((i) => i.id === container.id)),
                })[0]?.id;
            }

            lastOverId.current = overId;

            return [{id: overId}];
        }

        // When a draggable item moves to a new container, the layout may shift
        // and the `overId` may become `null`. We manually set the cached `lastOverId`
        // to the id of the draggable item that was moved to the new container, otherwise
        // the previous `overId` will be returned which can cause items to incorrectly shift positions
        if (recentlyMovedToNewContainer.current) {
            lastOverId.current = activeId;
        }

        // If no droppable is matched, return the last match
        return lastOverId.current ? [{id: lastOverId.current}] : [];
    }, [activeId, sections]);

    return collisionDetectionStrategy;
}

function sortedItems(items: Array<SimpleProjectBoardItem>) {
    const sorted = [...items];

    sorted.sort((a, b) => a.position - b.position);

    return sorted;
}

function createSections(board: ProjectBoard): Array<Section> {
    const sections = [...board.sections];
    sections.sort((a, b) => a.position - b.position);

    return sections.map((section) => ({
        id: section.id,
        title: section.title,
        items: sortedItems(section.items).map((item) => ({
            ...item,
            id: item.id,
            title: item.title,
        }))
    }));
}

function findSectionId(sections: Array<Section>, id: UniqueIdentifier) {
    for (const section of sections) {
        if (section.id === id) {
            return section.id;
        }

        for (const item of section.items) {
            if (item.id === id) {
                return section.id;
            }
        }
    }

    return undefined;
}

function findSectionItems(sections: Array<Section>, id: UniqueIdentifier) {
    for (const section of sections) {
        if (section.id === id) {
            return section.items;
        }
    }

    return undefined;
}