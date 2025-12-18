"use client";

import { useEffect, useRef, useState } from "react";
import type { DialogState } from "../types/DialogState";
import ContentDialog from "./ContentDialog";
import { isNullOrWhiteSpace } from "../utils/string";
import Button from "./input/Button";

export default function TextInputDialog(props: {
    state: DialogState,
    heading: string,
    placeholder: string,
    acceptTitle: string,
    disabled?: boolean,
    initialValue?: string,
    onAcceptClick: (text: string) => void,
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [text, setText] = useState<string>("");

    useEffect(() => {
        if (props.state.isOpen) {
            setText(props.initialValue || "");
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    }, [props.state.isOpen, props.initialValue]);

    return (
        <ContentDialog
            ref={props.state.dialogRef}
            state={props.state}
            heading={props.heading}
            className="max-w-lg">
            <form
                className="flex flex-col gap-3 pt-2"
                onSubmit={(e) => {
                    e.preventDefault();

                    if (!isNullOrWhiteSpace(text)) {
                        props.onAcceptClick(text);
                    }
                }}>
                <input
                    ref={inputRef}
                    className="bg-surface border border-outline rounded-lg py-1 px-2"
                    disabled={props.disabled}
                    placeholder={props.placeholder}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)} />
                <Button
                    type="submit"
                    variant="primary"
                    className="self-end"
                    disabled={props.disabled || isNullOrWhiteSpace(text)}>
                    {props.acceptTitle}
                </Button>
            </form>
        </ContentDialog>
    );
}