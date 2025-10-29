import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import Button from "../Button";
import { cn } from "../../utils/tailwind";
import { LuGripVertical } from "react-icons/lu";

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
            <LuGripVertical />
        </Button>
    );
}
