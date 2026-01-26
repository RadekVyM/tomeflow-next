"use client";

import { DialogState } from "@/app/types/DialogState";
import { DataImage } from "@/app/types/DataImage";
import { memo, useEffect, useRef, useState } from "react";
import MarkdownTextArea from "./MarkdownTextArea";
import { Dialog } from "../Dialog";
import Button from "../input/Button";
import { TbX } from "react-icons/tb";
import ActionButtons from "./ActionButtons";
import MarkdownPreview from "./MarkdownPreview";
import useDebouncedValue from "@/app/hooks/useDebouncedValue";
import useDimensionsListener from "@/app/hooks/useDimensionsListener";
import { isNullOrWhiteSpace } from "@/app/utils/string";

const SAVE_INTERVAL = 5000;

export default function MarkdownEditorDialog(props: {
    state: DialogState,
    text?: string | null,
    projectId: string,
    isSavePending?: boolean,
    onSave: (text: string) => void,
}) {
    const intervalSaveRef = useRef<() => void | null>(null);

    async function onClose() {
        intervalSaveRef.current?.();
        await props.state.hide();
    }

    return (
        <Dialog
            ref={props.state.dialogRef}
            state={props.state}
            onEscape={onClose}
            outerClassName="pb-0"
            className="thin-scrollbar bg-surface text-on-surface isolate w-full h-full max-h-full max-w-450 overflow-hidden rounded-t-2xl flex flex-col">
            {props.state.isOpen && <Content
                projectId={props.projectId}
                text={props.text}
                isSavePending={props.isSavePending}
                onSave={props.onSave}
                onClose={onClose}
                intervalSaveRef={intervalSaveRef} />}
        </Dialog>
    );
}

function Content(props: {
    text?: string | null,
    projectId: string,
    isSavePending?: boolean,
    intervalSaveRef: React.RefObject<(() => void | null) | null>,
    onClose: () => void,
    onSave: (text: string) => void,
}) {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const textLoadedRef = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [text, setText] = useState("");
    const [textChanged, setTextChanged] = useState(false);
    const textAreaContainerRef = useRef<HTMLDivElement>(null);
    const noText = isNullOrWhiteSpace(text);

    useDimensionsListener(textAreaContainerRef, (rect) => {
        if (textAreaRef.current) {
            textAreaRef.current.style.minHeight = `${rect.height - 8}px`;
        }
    });

    useEffect(() => {
        if (!textLoadedRef.current && typeof props.text === "string") {
            setText(props.text);
            textLoadedRef.current = true;
        }
    }, [props.text]);

    useEffect(() => {
        intervalRef.current = setInterval(() => props.intervalSaveRef.current?.(), SAVE_INTERVAL);

        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    props.intervalSaveRef.current = () => save();

    function save() {
        if (!textChanged) {
            return;
        }

        props.onSave(text);
        setTextChanged(false);
    }

    function onImageSelected(image: DataImage) {
        if (!textAreaRef.current) {
            return;
        }

        const start = textAreaRef.current.selectionStart;
        const end = textAreaRef.current.selectionEnd;

        setText((old) => {
            const before = old.substring(0, start);
            const after = old.substring(end, old.length);
            const imageString = `\n![${image.title}](${image.id} "")\n`;

            if (textAreaRef.current) {
                textAreaRef.current.selectionStart = textAreaRef.current.selectionEnd = start + imageString.length;
            }

            return before + imageString + after;
        });
        setTextChanged(true);
    }

    return (
        <>
            <header
                className="flex justify-between items-start z-50 bg-inherit pt-4 px-5 pb-4">
                <div
                    className="flex flex-wrap justify-center items-center gap-2 pointer-events-auto">
                    <ActionButtons
                        text={text}
                        setText={setText}
                        setTextChanged={setTextChanged}
                        textAreaRef={textAreaRef}
                        onImageSelected={onImageSelected}
                        projectId={props.projectId} />
                </div>
                <div
                    className="text-xs text-on-surface-container bg-primary-lite px-1.5 border border-outline-variant rounded-lg -mb-1 mt-2 pointer-events-auto">
                    {props.isSavePending ?
                        "Saving changes..." :
                        textChanged ? "Unsaved changes" : "All changes saved"}
                </div>
                <Button
                    variant="icon-default"
                    onClick={props.onClose}>
                    <TbX className="w-5 h-5" />
                </Button>
            </header>
            <div
                className="flex-1 grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 gap-5 overflow-hidden px-5 pt-1">
                <div
                    ref={textAreaContainerRef}
                    className="bg-surface-container rounded-xl lg:rounded-b-none w-full border lg:border-b-0 border-outline overflow-y-auto max-h-full focus-within:outline-2 outline-primary">
                    <MarkdownTextArea
                        className="min-h-full"
                        textAreaClassName="lg:pb-5"
                        ref={textAreaRef}
                        text={text}
                        setText={setText}
                        setTextChanged={setTextChanged} />
                </div>

                {noText ?
                    <div className="border-2 border-b-0 border-dashed border-outline-variant rounded-t-xl grid place-content-center text-center text-on-surface-muted text-sm">
                        No content
                    </div> :
                    <div
                        className="overflow-y-auto max-h-full px-5 pb-5 -mx-5">
                        <Preview
                            text={text} />
                    </div>}
            </div>
        </>
    )
}

const Preview = memo((props: {
    text: string,
}) => {
    const text = useDebouncedValue(props.text, 1000);

    return (
        <MarkdownPreview
            text={text || props.text} />
    );
});