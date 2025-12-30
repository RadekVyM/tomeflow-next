"use client";

import useIsDark from "../hooks/useIsDark";
import { cn } from "../utils/tailwind";
import { useEffect, useRef, useState } from "react";
import { LuEye, LuImage, LuPencil, LuSave } from "react-icons/lu";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import lightStyle from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import darkStyle from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import rehypeSlug from "rehype-slug";
import useDialog from "../hooks/useDialog";
import SelectImageDialog from "./images/SelectImageDialog";
import { isNullOrWhiteSpace } from "../utils/string";
import Button from "./input/Button";
import { DataImage } from "../types/DataImage";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import UniversalImage from "./images/UniversalImage";
import ImagePreviewDialog from "./images/ImagePreviewDialog";

const SAVE_INTERVAL = 5000;

export default function MarkdownPreviewer(props: {
    className?: string,
    actionsWrapperClassName?: string,
    text?: string | null,
    editorType: "editor-first" | "preview-first",
    projectId: string,
    isSavePending?: boolean,
    editButtonHidden?: boolean,
    editable: boolean,
    setEditable: React.Dispatch<React.SetStateAction<boolean>>,
    onSave: (text: string) => void,
}) {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const intervalSaveRef = useRef<() => void | null>(null);
    const [text, setText] = useState(props.text || "");
    const [isPreview, setIsPreview] = useState(false);
    const [textChanged, setTextChanged] = useState(false);

    useEffect(() => setIsPreview(false), [props.editable]);
    useEffect(() => textAreaRef.current?.focus(), [props.editable, isPreview]);

    useEffect(() => {
        if (!props.editable) {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            return;
        }

        intervalRef.current = setInterval(() => intervalSaveRef.current?.(), SAVE_INTERVAL);

        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [props.editable]);

    intervalSaveRef.current = () => save();

    function save() {
        if (!textChanged) {
            return;
        }

        props.onSave(text);
        setTextChanged(false);
    }

    function onSaveClick() {
        save();
        props.setEditable(false);
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
        <div
            className={cn("flex flex-col", props.className)}>
            {(!props.editable || isPreview) ? 
                <MarkdownInternal
                    text={text} /> :
                <textarea
                    ref={textAreaRef}
                    className="font-mono bg-surface-container border border-outline rounded-lg py-1 px-2 w-full resize-none field-sizing-content min-h-0"
                    value={text}
                    onChange={(e) => {
                        setTextChanged(true);
                        setText(e.target.value);
                    }}
                    style={{ height: "auto" }}
                    onKeyDown={(e) => {
                        if (e.key !== "Tab") {
                            return;
                        }

                        e.preventDefault();

                        const start = e.currentTarget.selectionStart;
                        const end = e.currentTarget.selectionEnd;

                        setText((value) => {
                            const before = value.substring(0, start);
                            const after = value.substring(end, value.length);

                            return before + "\t" + after;
                        });
                        setTextChanged(true);

                        setTimeout(() => {
                            if (!textAreaRef.current) {
                                return;
                            }

                            textAreaRef.current.selectionStart = textAreaRef.current.selectionEnd = start + 1;
                        }, 20);
                    }}>
                </textarea>}
            {!(!props.editable && props.editButtonHidden) &&
                <div
                    className={cn("flex flex-col sticky bottom-2 self-center items-center", props.actionsWrapperClassName)}>
                    {props.editable &&
                        <div
                            className="text-xs text-on-surface-container bg-primary-lite px-1.5 border border-outline-variant rounded-lg -mb-1 mt-2">
                            {props.isSavePending ?
                                "Saving changes..." :
                                textChanged ? "Unsaved changes" : "All changes saved"}
                        </div>}
                    <div
                        className="flex gap-2 mt-3">
                        <ActionButtons
                            text={text}
                            editable={props.editable}
                            setEditable={props.setEditable}
                            isPreview={isPreview}
                            setIsPreview={setIsPreview}
                            onSaveClick={onSaveClick}
                            onImageSelected={onImageSelected}
                            projectId={props.projectId} />
                    </div>
                </div>}
        </div>
    );
}

function ActionButtons(props: {
    text: string,
    projectId: string,
    editable: boolean,
    isPreview: boolean,
    setIsPreview: React.Dispatch<React.SetStateAction<boolean>>,
    setEditable: React.Dispatch<React.SetStateAction<boolean>>,
    onSaveClick: () => void,
    onImageSelected: (image: DataImage) => void,
}) {
    if (!props.editable) {
        return (
            <Button
                key="toggle"
                onClick={() => props.setEditable(true)}
                variant="container">
                <LuPencil /> Edit
            </Button>
        );
    }

    return (
        <>
            <Button
                onClick={() => props.setIsPreview((old) => !old)}
                variant={props.isPreview ? "primary" : "container"}>
                <LuEye /> Preview
            </Button>
            <ImagesButton
                projectId={props.projectId}
                disabled={props.isPreview}
                onImageSelected={props.onImageSelected} />
            <Button
                onClick={props.onSaveClick}
                variant="primary">
                <LuSave /> Save
            </Button>
        </>
    );
}

function ImagesButton(props: {
    projectId: string,
    disabled?: boolean,
    onImageSelected: (image: DataImage) => void,
}) {
    const dialogState = useDialog();

    return (
        <>
            <Button
                onClick={dialogState.show}
                variant="container"
                disabled={props.disabled}>
                <LuImage /> Images
            </Button>

            <SelectImageDialog
                projectId={props.projectId}
                state={dialogState}
                onImageSelected={props.onImageSelected} />
        </>
    );
}

function MarkdownInternal(props: {
    className?: string,
    text: string,
}) {
    const isDark = useIsDark();

    if (isNullOrWhiteSpace(props.text)) {
        return undefined;
    }

    return (
        <article
            className={cn("markdown", props.className)}>
            <Markdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeSlug, rehypeKatex]}
                components={{
                    img(props) {
                        return (
                            <CustomImage
                                {...props} />
                        );
                    },
                    code(props) {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || "");

                        return match ? (
                            <SyntaxHighlighter
                                PreTag="div"
                                children={String(children).replace(/\n$/, "")}
                                language={match[1]}
                                style={isDark ? darkStyle : lightStyle}
                                customStyle={{
                                    fontSize: "15px",
                                    margin: 0,
                                    paddingInline: "calc(var(--spacing) * 3)",
                                    paddingBlock: "calc(var(--spacing) * 1)",
                                    border: "none",
                                }} />
                            ) : (
                            <code
                                {...rest}
                                className={cn("plain-code", className)}>
                                {children}
                            </code>
                        );
                    }
                }}>
                {props.text}
            </Markdown>
        </article>
    );
}

function CustomImage(props: {
    src?: string | Blob,
    alt?: string,
    title?: string,
}) {
    const dialogState = useDialog();

    return (
        <>
            <span
                className="block text-center">
                <button
                    className="mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={dialogState.show}>
                    <UniversalImage
                        className="rounded-lg max-h-[calc(100dvh-10rem)]"
                        {...props} />
                </button>
            </span>

            <ImagePreviewDialog
                state={dialogState}
                {...props} />
        </>
    );
}