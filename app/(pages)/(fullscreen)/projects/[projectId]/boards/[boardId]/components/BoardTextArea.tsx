"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/app/utils/tailwind";

export default function BoardTextArea(props: {
    disabled?: boolean,
    className?: string,
    placeholder?: string,
    focusOnDisplay?: boolean,
    value: string,
    onChange: (value: string) => void,
    onBlur?: () => void,
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (props.focusOnDisplay && textareaRef.current) {
            textareaRef.current.focus();
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
        }
    }, [props.focusOnDisplay]);

    return (
        <textarea
            ref={textareaRef}
            className={cn("py-1 px-2 resize-none field-sizing-content min-h-0 bg-surface-container border border-outline-variant hover:border-outline outline-primary rounded-lg wrap-break-word thin-scrollbar", props.className)}
            placeholder={props.placeholder}
            value={props.value}
            disabled={props.disabled}
            onBlur={props.onBlur}
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