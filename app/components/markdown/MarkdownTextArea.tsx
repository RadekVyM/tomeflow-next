import Prism from "prismjs";
import "prismjs/components/prism-markdown";
//import 'prismjs/themes/prism-dark.css';
import "./MarkdownTextArea.css";
import { isCtrl } from "@/app/utils/html";

export default function TextArea(props: {
    ref: React.RefObject<HTMLTextAreaElement | null>,
    text: string,
    setTextChanged: React.Dispatch<React.SetStateAction<boolean>>,
    setText: React.Dispatch<React.SetStateAction<string>>,
}) {
    function highlightedText() {
        const html = Prism.highlight(props.text, Prism.languages.markdown, "markdown");
        return html + (props.text.endsWith("\n") ? " " : "");
    }

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
            insertFormatting(e, 1, (before, selectedText, after) => before + e.key + selectedText + pairs[e.key] + after);
        }

        if (e.key === "Tab") {
            if (e.shiftKey) {
                insertFormatting(
                    e,
                    -1,
                    (before, selectedText, after) => {
                        if (before.length === 0) {
                            return before + selectedText + after;
                        }

                        if (before.endsWith("\t")) {
                            return before.slice(0, before.length - 1) + selectedText + after;
                        }

                        const lastBreakLineIndex = before.lastIndexOf("\n");
                        const lastLine = lastBreakLineIndex === undefined ? before : before.slice(lastBreakLineIndex + 1);

                        if (lastLine.startsWith("\t")) {
                            return (lastBreakLineIndex === undefined ? "" : before.slice(0, lastBreakLineIndex + 1)) +
                                lastLine.slice(1) + selectedText + after;
                        }

                        return before + selectedText + after;
                    });
            }
            else {
                insertFormatting(
                    e,
                    (textArea, start) => textArea.selectionStart = textArea.selectionEnd = start + 1,
                    (before, _selectedText, after) => before + "\t" + after);
            }
        }

        if (isCtrl(e) && e.key.toLowerCase() === "b") {
            insertFormatting(e, 2, (before, selectedText, after) => before + "**" + selectedText + "**" + after);
        }

        if (isCtrl(e) && e.key.toLowerCase() === "i") {
            if (e.shiftKey) {
                insertFormatting(e, 2, (before, selectedText, after) => before + "![" + selectedText + "](url)" + after);
            }
            else {
                insertFormatting(e, 1, (before, selectedText, after) => before + "*" + selectedText + "*" + after);
            }
        }

        if (isCtrl(e) && (e.key.toLowerCase() === "l" || e.key.toLowerCase() === "e")) {
            insertFormatting(e, 1, (before, selectedText, after) => before + "`" + selectedText + "`" + after);
        }

        if (isCtrl(e) && e.key.toLowerCase() === "k") {
            insertFormatting(e, 1, (before, selectedText, after) => before + "[" + selectedText + "](url)" + after);
        }
    }

    function insertFormatting(
        e: React.KeyboardEvent<HTMLTextAreaElement>,
        offsetSelection: number | ((textArea: HTMLTextAreaElement, start: number, end: number) => void),
        inserter: (before: string, selectedText: string, after: string) => string,
    ) {
        e.preventDefault();

        if (!props.ref.current) {
            return;
        }

        const start = props.ref.current.selectionStart;
        const end = props.ref.current.selectionEnd;

        const oldText = props.text;
        const selectedText = oldText.substring(start, end);
        const before = oldText.substring(0, start);
        const after = oldText.substring(end, oldText.length);
        const newText = inserter(before, selectedText, after);
        const changed = newText !== oldText;

        if (!changed) {
            return;
        }

        props.ref.current.setRangeText(newText, 0, oldText.length);
        props.setText(newText);
        props.setTextChanged(true);

        props.ref.current.focus();

        if (typeof offsetSelection === "function") {
            offsetSelection(props.ref.current, start, end);
        }
        else {
            props.ref.current.setSelectionRange(start + offsetSelection, end + offsetSelection);
        }
    };

    return (
        <div
            className="markdown-textarea bg-surface-container relative isolate font-mono rounded-lg w-full border border-outline">
            <pre
                className="z-0 isolate pointer-events-none select-none absolute inset-0 py-1 px-2 w-full wrap-break-anywhere overflow-hidden whitespace-pre-wrap wrap-break-word"
                aria-hidden
                dangerouslySetInnerHTML={{ __html: highlightedText() }} />

            <textarea
                ref={props.ref}
                className="relative z-30 py-1 px-2 bg-transparent text-transparent caret-primary rounded-lg w-full resize-none field-sizing-content min-h-0 m-0 -mb-2"
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