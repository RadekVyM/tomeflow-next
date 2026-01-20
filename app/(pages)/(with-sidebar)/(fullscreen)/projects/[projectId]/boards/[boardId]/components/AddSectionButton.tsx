"use client";

import Button from "@/app/components/input/Button";
import { TbPlus } from "react-icons/tb";

export default function AddSectionButton(props: {
    disabled?: boolean,
    onClick?: () => void,
}) {
    return (
        <Button
            className="min-w-72 h-full border border-outline-variant rounded-2xl place-content-center text-on-surface-muted"
            onClick={props.onClick}
            disabled={props.disabled}>
            <TbPlus /> New section
        </Button>
    );
}