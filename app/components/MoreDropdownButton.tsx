"use client";

import { LuEllipsisVertical } from "react-icons/lu";
import DropDownButton from "./input/DropdownButton";
import { cn } from "../utils/tailwind";
import type { IconType } from "react-icons";
import Button from "./input/Button";

export function MoreDropdownButton(props: {
    className?: string,
    size?: "sm" | "default",
    children?: React.ReactNode,
    disabled?: boolean,
    id: string,
}) {
    return (
        <DropDownButton
            className={props.className}
            id="projects-more"
            variant="icon-container"
            size={props.size}
            title="More"
            icon={LuEllipsisVertical}
            disabled={props.disabled}>
            <ul
                className="flex flex-col items-stretch gap-1 p-1.5">
                {props.children}
            </ul>
        </DropDownButton>
    );
}

export function MoreDropdownListButton(props: {
    className?: string,
    title: string,
    icon: IconType,
    onClick?: () => void,
}) {
    const Icon = props.icon;

    return (
        <li>
            <Button
                className={cn("w-full", props.className)}
                size="sm"
                onClick={props.onClick}>
                <Icon /> {props.title}
            </Button>
        </li>
    );
}