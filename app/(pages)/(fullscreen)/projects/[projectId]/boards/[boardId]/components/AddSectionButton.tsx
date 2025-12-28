"use client";

import Button from "@/app/components/input/Button";
import { LuPlus } from "react-icons/lu";

export default function AddSectionButton(props: {
    disabled?: boolean,
    onClick?: () => void,
}) {
    return (
        <Button
            className="min-w-72 h-full border border-outline-variant rounded-xl place-content-center text-on-surface-muted"
            onClick={props.onClick}
            disabled={props.disabled}>
            <LuPlus /> New section
        </Button>
    );
}