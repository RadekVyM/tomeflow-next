"use client";

import { useRef, useState } from "react";
import { cn } from "@/app/utils/tailwind";
import { isNullOrWhiteSpace } from "@/app/utils/string";
import { LuPlus } from "react-icons/lu";
import BoardTextArea from "./BoardTextArea";
import Button from "@/app/components/input/Button";

export default function NewItemForm(props: {
    className?: string,
    placeholder: string,
    submitTitle: string,
    onSubmit?: (text: string) => void,
}) {
    const formRef = useRef<HTMLFormElement>(null);
    const [text, setText] = useState<string>("");

    return (
        <form
            ref={formRef}
            className={cn("flex gap-2 overflow-hidden max-h-32", props.className)}
            onSubmit={(e) => {
                e.preventDefault();

                if (isNullOrWhiteSpace(text)) {
                    return;
                }

                props.onSubmit?.(text);
                setText("");
            }}>
            <BoardTextArea
                className="flex-1"
                placeholder={props.placeholder}
                value={text}
                onChange={setText} />
            <Button
                type="submit"
                variant="icon-primary"
                title={props.submitTitle}
                className="self-end">
                <LuPlus />
            </Button>
        </form>
    );
}