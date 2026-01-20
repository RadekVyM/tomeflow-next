import Prism from "prismjs";
import "prismjs/components/prism-markdown";
//import 'prismjs/themes/prism-dark.css';
import "./MarkdownTextArea.css";
import { isCtrl } from "@/app/utils/html";
import useInsertFormatting from "./useInsertFormatting";
import { useMemo } from "react";

export default function TextArea(props: {
    ref: React.RefObject<HTMLTextAreaElement | null>,
    text: string,
    setTextChanged: React.Dispatch<React.SetStateAction<boolean>>,
    setText: React.Dispatch<React.SetStateAction<string>>,
}) {
    const {
        insertFormatting,
        insertTab,
        removeTab,
        insertBold,
        insertItalic,
        insertInlineCode,
        insertLink,
        insertImage,
    } = useInsertFormatting(props.ref, props.text, props.setTextChanged, props.setText);

    const highlightedText = useMemo(() => {
        const html = Prism.highlight(props.text, Prism.languages.markdown, "markdown");
        return html + (props.text.endsWith("\n") ? " " : "");
    }, [props.text]);

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        const pairs: { [kye: string]: string } = {
            '"': '"',
            "'": "'",
            "`": "`",
            "(": ")",
            "[": "]",
            "{": "}",
        };

        if (!props.ref.current) {
            return;
        }

        if (!isCtrl(e) && pairs[e.key] && props.ref.current.selectionStart !== props.ref.current.selectionEnd) {
            e.preventDefault();
            insertFormatting(1, (before, selectedText, after) => before + e.key + selectedText + pairs[e.key] + after);
        }

        if (e.key === "Tab") {
            e.preventDefault();
            if (e.shiftKey) {
                removeTab();
            }
            else {
                insertTab();
            }
        }

        if (isCtrl(e) && e.key.toLowerCase() === "b") {
            e.preventDefault();
            insertBold();
        }

        if (isCtrl(e) && e.key.toLowerCase() === "i") {
            e.preventDefault();
            if (e.shiftKey) {
                insertImage();
            }
            else {
                insertItalic();
            }
        }

        if (isCtrl(e) && (e.key.toLowerCase() === "l" || e.key.toLowerCase() === "e")) {
            e.preventDefault();
            insertInlineCode();
        }

        if (isCtrl(e) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            insertLink();
        }
    }

    return (
        <div
            className="markdown-textarea bg-surface-container relative isolate font-mono rounded-xl w-full border border-outline">
            <pre
                className="z-0 isolate pointer-events-none select-none absolute inset-0 py-1 px-2 w-full wrap-break-anywhere overflow-hidden whitespace-pre-wrap wrap-break-word"
                aria-hidden
                dangerouslySetInnerHTML={{ __html: highlightedText }} />

            <textarea
                ref={props.ref}
                className="relative z-30 py-1 px-2 bg-transparent text-transparent caret-primary dark:caret-primary-dim outline-primary rounded-xl w-full resize-none field-sizing-content min-h-0 m-0 -mb-2"
                style={{ height: "auto" }}
                value={props.text}
                onChange={(e) => {
                    props.setTextChanged(true);
                    props.setText(e.target.value);
                }}
                onKeyDown={onKeyDown}>
            </textarea>
        </div>
    );
}