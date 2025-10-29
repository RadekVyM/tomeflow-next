import { useEffect, useRef, useState } from "react";
import type { DialogState } from "../types/DialogState";
import ContentDialog from "./ContentDialog";
import Button from "./Button";
import { isNullOrWhiteSpace } from "../utils/string";

export default function TextInputDialog(props: {
    state: DialogState,
    heading: string,
    placeholder: string,
    acceptTitle: string,
    initialValue?: string,
    onAcceptClick: (text: string) => Promise<void>,
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
                onSubmit={async (e) => {
                    e.preventDefault();
                    await props.onAcceptClick(text);
                }}>
                <input
                    ref={inputRef}
                    className="bg-surface border border-outline rounded-lg py-1 px-2"
                    placeholder={props.placeholder}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)} />
                <Button
                    type="submit"
                    variant="primary"
                    className="self-end"
                    disabled={isNullOrWhiteSpace(text)}>
                    {props.acceptTitle}
                </Button>
            </form>
        </ContentDialog>
    );
}