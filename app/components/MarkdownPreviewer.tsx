import useIsDark from "../hooks/useIsDark";
import { cn } from "../utils/tailwind";
import { useEffect, useRef, useState } from "react";
import { LuEye, LuImage, LuPencil, LuSave, LuX } from "react-icons/lu";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import lightStyle from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import darkStyle from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import rehypeSlug from "rehype-slug";
import useDialog from "../hooks/useDialog";
import ImagesDialog from "./ImagesDialog";
import LocalImage from "./LocalImage";
import { Dialog } from "./Dialog";
import { isNullOrWhiteSpace } from "../utils/string";
import Button from "./input/Button";

const SAVE_INTERVAL = 5000;

export default function MarkdownPreviewer(props: {
    className?: string,
    actionsWrapperClassName?: string,
    text?: string,
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

    // @ts-expect-error
    function onImageSelected(image: DataImageDto) {
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
    // @ts-expect-error
    onImageSelected: (image: DataImageDto) => void,
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
    // @ts-expect-error
    onImageSelected: (image: DataImageDto) => void,
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

            <ImagesDialog
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
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
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

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function CustomImage(props: {
    src?: string | Blob,
    alt?: string,
    title?: string
}) {
    const dialogState = useDialog();
    const isLocalImage = !!props.src && typeof props.src === "string" && GUID_REGEX.test(props.src);

    return (
        <>
            <span
                className="block text-center">
                <button
                    className="mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={dialogState.show}>
                    {props.src && typeof props.src === "string" && isLocalImage ?
                        <LocalImage
                            className="rounded-md max-h-[calc(100dvh-10rem)]"
                            imageId={props.src} /> :
                        <img
                            className="rounded-md max-h-[calc(100dvh-10rem)]"
                            {...props} />}
                </button>
            </span>

            <Dialog
                ref={dialogState.dialogRef}
                state={dialogState}
                outerClassName="m-0 p-0"
                className="relative isolate bg-transparent border-0 w-full h-full grid place-content-center max-h-screen max-w-screen">
                {props.src && typeof props.src === "string" && isLocalImage ?
                    <LocalImage
                        className="max-h-screen max-w-screen"
                        imageId={props.src} /> :
                    <img
                        className="max-h-screen max-w-screen"
                        {...props} />}
                
                <Button
                    className="absolute top-0 right-0 m-6"
                    variant="icon-container"
                    title="Close"
                    onClick={dialogState.hide}>
                    <LuX />
                </Button>
            </Dialog>
        </>
    );
}