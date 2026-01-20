"use client";

import { useEffect, useRef, useState } from "react";
import type { DialogState } from "../types/DialogState";
import ContentDialog from "./ContentDialog";
import { isNullOrWhiteSpace } from "../utils/string";
import DefaultButton from "./input/DefaultButton";
import { IconType } from "react-icons";

export default function TextInputDialog(props: {
    state: DialogState,
    heading: string,
    placeholder: string,
    acceptTitle: string,
    acceptIcon?: IconType,
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
                    className="bg-surface border border-outline outline-primary rounded-xl py-1.5 px-2.5"
                    disabled={props.disabled}
                    placeholder={props.placeholder}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)} />
                <DefaultButton
                    type="submit"
                    variant="primary"
                    className="self-end"
                    disabled={props.disabled || isNullOrWhiteSpace(text)}
                    icon={props.acceptIcon}>
                    {props.acceptTitle}
                </DefaultButton>
            </form>
        </ContentDialog>
    );
}