"use client";

import useIsDark from "../../hooks/useIsDark";
import { cn } from "../../utils/tailwind";
import { memo, useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import lightStyle from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import darkStyle from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import rehypeSlug from "rehype-slug";
import useDialog from "../../hooks/useDialog";
import { isNullOrWhiteSpace } from "../../utils/string";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import UniversalImage from "../images/UniversalImage";
import ImagePreviewDialog from "../images/ImagePreviewDialog";
import useIsClient from "@/app/hooks/useIsClient";

const MarkdownPreview = memo((props: {
    className?: string,
    text: string,
    onReplaceClick?: () => void,
}) => {
    const isDark = useIsDark();
    const isClient = useIsClient();
    const [highlightSyntax, setHighlightSyntax] = useState(false);

    useEffect(() => {
        if (isClient) {
            const timeout = setTimeout(() => setHighlightSyntax(true), 10);
            return () => clearTimeout(timeout);
        }
    }, [isClient]);

    const onReplaceClick = props.onReplaceClick;

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
                    a(props) {
                        const videoId = props.href ? extractYouTubeVideoId(props.href) : null;

                        if (videoId) {
                            return (
                                <span
                                    className="block relative w-full aspect-video my-4">
                                    <iframe
                                        className="absolute inset-0 w-full h-full rounded-xl"
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title="YouTube video" />
                                </span>
                            );
                        }

                        if (props.href && isVideoUrl(props.href)) {
                            return (
                                <span>
                                    <a {...props} />
                                    <video
                                        className="block w-full rounded-xl my-2 max-h-[calc(100dvh-10rem)]"
                                        controls>
                                        <source
                                            src={props.href} />
                                    </video>
                                </span>
                            );
                        }

                        return <a {...props} />;
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
                    },
                    table({ className, node, ...props }) {
                        return (
                            <div
                                className={className}>
                                <table {...props} />
                            </div>
                        );
                    }
                }}>
                {props.text}
            </Markdown>
        </article>
    );
});

export default MarkdownPreview;

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
                    className="rounded-xl max-h-[calc(100dvh-10rem)]"
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

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|avi|mkv|ogv)(\?.*)?$/i;

function isVideoUrl(url: string): boolean {
    return VIDEO_EXTENSIONS.test(url);
}

function extractYouTubeVideoId(url: string): string | null {
    try {
        const parsed = new URL(url);

        if (parsed.hostname === "youtu.be") {
            return parsed.pathname.slice(1);
        }

        if (parsed.hostname.includes("youtube.com")) {
            return parsed.searchParams.get("v");
        }

        return null;
    }
    catch {
        return null;
    }
}