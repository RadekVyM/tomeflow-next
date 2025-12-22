"use client";

import type { IconType } from "react-icons";
import Button from "./Button";
import "./DropdownButton.css";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "../variants/buttonVariants";
import { cn } from "../../utils/tailwind";

export default function DropDownButton(props: {
    id: string,
    title: string,
    icon: IconType,
    children?: React.ReactNode,
    className?: string,
    disabled?: boolean,
} & VariantProps<typeof buttonVariants>) {
    const Icon = props.icon;
    const anchorId = `--${props.id}-anchor`;
    const popoverId = `dropdown-button-menu-${props.id}`;

    return (
        <>
            <Button
                id={props.id}
                className={cn("dropdown-button", props.className)}
                variant={props.variant}
                size={props.size}
                title={props.disabled ? undefined : props.title}
                popoverTarget={popoverId}
                style={{
                    "anchorName": anchorId,
                }}
                disabled={props.disabled}>
                <Icon />
            </Button>

            <article
                id={popoverId}
                className="dropdown-button-menu slide-down-popover-transition bg-surface-container rounded-xl mt-1 w-max
                    border border-outline-variant
                    drop-shadow-xl drop-shadow-shade"
                popover="auto"
                style={{
                    "positionAnchor": anchorId,
                }}
                onClick={() => document.getElementById(popoverId)?.hidePopover()}>
                {props.children}
            </article>
        </>
    );
}