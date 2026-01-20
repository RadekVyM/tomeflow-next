"use client";

import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { cn } from "@/app/utils/tailwind";
import { TbGripVertical } from "react-icons/tb";
import Button from "@/app/components/input/Button";

export default function Handle(props: {
    className?: string,
    disabled?: boolean,
    attributes?: DraggableAttributes,
    listeners?: SyntheticListenerMap | undefined,
    size?: "sm" | "default",
    isDragging?: boolean,
    setActivatorNodeRef?: (element: HTMLElement | null) => void,
}) {
    return (
        <Button
            // @ts-expect-error
            ref={props.setActivatorNodeRef}
            variant="icon-default"
            size={props.size}
            className={cn("cursor-grab text-on-surface-container-muted", props.isDragging && "cursor-grabbing", props.className)}
            disabled={props.disabled}
            {...props.attributes}
            {...props.listeners}>
            <TbGripVertical />
        </Button>
    );
}
