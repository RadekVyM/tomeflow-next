"use client";

import { useRef, useState } from "react";
import { cn } from "@/app/utils/tailwind";
import { isNullOrWhiteSpace } from "@/app/utils/string";
import { TbPlus } from "react-icons/tb";
import BoardTextArea from "./BoardTextArea";
import Button from "@/app/components/input/Button";

export default function NewItemForm(props: {
    className?: string,
    placeholder: string,
    submitTitle: string,
    disabled?: boolean,
    onSubmit?: (text: string) => void,
}) {
    const formRef = useRef<HTMLFormElement>(null);
    const [text, setText] = useState<string>("");

    return (
        <form
            ref={formRef}
            className={cn("flex gap-1.5 overflow-hidden max-h-32", props.className)}
            onSubmit={(e) => {
                e.preventDefault();

                if (props.disabled || isNullOrWhiteSpace(text)) {
                    return;
                }

                props.onSubmit?.(text);
                setText("");
            }}>
            <BoardTextArea
                className="flex-1"
                disabled={props.disabled}
                placeholder={props.placeholder}
                value={text}
                onChange={setText} />
            <Button
                disabled={props.disabled}
                type="submit"
                variant="icon-primary"
                title={props.submitTitle}
                className="self-end min-w-[calc(var(--spacing)*8+2px)]">
                <TbPlus />
            </Button>
        </form>
    );
}