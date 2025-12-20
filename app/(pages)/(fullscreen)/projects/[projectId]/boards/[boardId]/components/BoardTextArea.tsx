"use client";

import { useRef } from "react";
import { cn } from "@/app/utils/tailwind";

export default function BoardTextArea(props: {
    disabled?: boolean,
    className?: string,
    placeholder?: string,
    value: string,
    onChange: (value: string) => void,
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    return (
        <textarea
            ref={textareaRef}
            className={cn("py-1 px-2 resize-none field-sizing-content min-h-0 bg-surface-container border border-outline rounded-lg break-words thin-scrollbar", props.className)}
            placeholder={props.placeholder}
            value={props.value}
            disabled={props.disabled}
            onChange={(e) => props.onChange(e.target.value.replace("\n", ""))}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();

                    const parentForm = textareaRef.current?.closest("form");

                    const submitEvent = new Event("submit", {
                        bubbles: true,
                        cancelable: true
                    });
                    parentForm?.dispatchEvent(submitEvent);
                }
            }} />
    );
}