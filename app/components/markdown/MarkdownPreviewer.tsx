"use client";

import useIsDark from "../../hooks/useIsDark";
import { cn } from "../../utils/tailwind";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import lightStyle from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import darkStyle from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import rehypeSlug from "rehype-slug";
import useDialog from "../../hooks/useDialog";
import { isNullOrWhiteSpace } from "../../utils/string";
import { DataImage } from "../../types/DataImage";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import UniversalImage from "../images/UniversalImage";
import ImagePreviewDialog from "../images/ImagePreviewDialog";
import MarkdownTextArea from "./MarkdownTextArea";
import useIsClient from "@/app/hooks/useIsClient";
import ActionButtons from "./ActionButtons";

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
    const textLoadedRef = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const intervalSaveRef = useRef<() => void | null>(null);
    const [text, setText] = useState("");
    const [isPreview, setIsPreview] = useState(false);
    const [textChanged, setTextChanged] = useState(false);

    useEffect(() => {
        if (!textLoadedRef.current && typeof props.text === "string") {
            setText(props.text);
            textLoadedRef.current = true;
        }
    }, [props.text]);

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
                    text={text}
                    onReplaceClick={() => {
                        props.setEditable(true);
                        setIsPreview(false);
                    }} /> :
                <MarkdownTextArea
                    ref={textAreaRef}
                    text={text}
                    setText={setText}
                    setTextChanged={setTextChanged} />}
            {!(!props.editable && props.editButtonHidden) &&
                <div
                    className={cn("flex flex-col sticky -bottom-px pb-2 items-center pointer-events-none", props.actionsWrapperClassName)}>
                    {props.editable &&
                        <div
                            className="text-xs text-on-surface-container bg-primary-lite px-1.5 border border-outline-variant rounded-lg -mb-1 mt-2 pointer-events-auto">
                            {props.isSavePending ?
                                "Saving changes..." :
                                textChanged ? "Unsaved changes" : "All changes saved"}
                        </div>}
                    <div
                        className="flex flex-wrap justify-center items-center gap-2 mt-3 pointer-events-auto">
                        <ActionButtons
                            text={text}
                            setText={setText}
                            setTextChanged={setTextChanged}
                            textAreaRef={textAreaRef}
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

function MarkdownInternal(props: {
    className?: string,
    text: string,
    onReplaceClick: () => void,
}) {
    const isDark = useIsDark();
    const isClient = useIsClient();
    const [highlightSyntax, setHighlightSyntax] = useState(false);

    useEffect(() => {
        if (isClient) {
            const timeout = setTimeout(() => setHighlightSyntax(true), 10);
            return () => clearTimeout(timeout);
        }
    }, [isClient]);

    function onReplaceClick() {
        props.onReplaceClick();
    }

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
                                onReplaceClick={onReplaceClick}
                                {...props} />
                        );
                    },
                    pre: (props) => {
                        if (!highlightSyntax) {
                            return (
                                <div className="pre">{props.children}</div>
                            );
                        }

                        return (
                            <pre>{props.children}</pre>
                        );
                    },
                    code(props) {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || "");

                        return highlightSyntax && match ? (
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
    onReplaceClick?: () => void,
}) {
    const dialogState = useDialog();

    return (
        <>
            <span
                className="block text-center">
                <UniversalImage
                    className="rounded-lg max-h-[calc(100dvh-10rem)]"
                    buttonClassName="mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={dialogState.show}
                    withStates
                    {...props} />
            </span>

            <ImagePreviewDialog
                state={dialogState}
                {...props} />
        </>
    );
}