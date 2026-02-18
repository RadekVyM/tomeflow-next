"use client";

import { useLayoutEffect, useState } from "react";

export default function useInsertFormatting(
    textAreaRef: React.RefObject<HTMLTextAreaElement | null>,
    text: string,
    setTextChanged: React.Dispatch<React.SetStateAction<boolean>>,
    setText: React.Dispatch<React.SetStateAction<string>>,
) {
    const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);

    useLayoutEffect(() => {
        if (selection && textAreaRef.current) {
            textAreaRef.current.setSelectionRange(selection.start, selection.end);
            setSelection(null);
        }
    }, [text]);

    function insertTab() {
        insertFormatting(
            (start) => ({ start: start + 1, end: start + 1 }),
            (before, _selectedText, after) => before + "\t" + after);
    }

    function removeTab() {
        insertFormatting(
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

    function indent() {
        const start = textAreaRef.current?.selectionStart ?? 0;
        const lineStart = text.lastIndexOf("\n", start - 1) + 1;

        insertFormatting(
            (selectionStart, selectionEnd) => ({ start: lineStart, end: lineStart + (selectionEnd - selectionStart) + (text.substring(lineStart, selectionEnd).split("\n").length) }),
            (before, selectedText, after) => before + selectedText.split("\n").map(l => "\t" + l).join("\n") + after,
            { start: lineStart, end: textAreaRef.current?.selectionEnd ?? 0 }
        );
    }

    function outdent() {
        const start = textAreaRef.current?.selectionStart ?? 0;
        const lineStart = text.lastIndexOf("\n", start - 1) + 1;

        insertFormatting(
            (_, selectionEnd) => {
                const lines = text.substring(lineStart, selectionEnd).split("\n");
                const removedCount = lines
                    .map((l) => l.match(/^(?:\t| {1,2})/g))
                    .reduce((previous, match) => previous + (match?.[0]?.length || 0), 0);

                return { start: lineStart, end: selectionEnd - removedCount };
            },
            (before, selectedText, after) => before + selectedText.split("\n").map(l => l.replace(/^(?:\t| {1,2})/, "")).join("\n") + after,
            { start: lineStart, end: textAreaRef.current?.selectionEnd ?? 0 }
        );
    }

    function insertBold() {
        insertFormatting(2, (before, selectedText, after) => before + "**" + selectedText + "**" + after);
    }

    function insertItalic() {
        insertFormatting(1, (before, selectedText, after) => before + "*" + selectedText + "*" + after);
    }

    function insertImage() {
        insertFormatting(2, (before, selectedText, after) => before + "![" + selectedText + "](url)" + after);
    }

    function insertInlineCode() {
        insertFormatting(1, (before, selectedText, after) => before + "`" + selectedText + "`" + after);
    }

    function insertLink() {
        insertFormatting(1, (before, selectedText, after) => before + "[" + selectedText + "](url)" + after);
    }

    async function cutLine() {
        if (!textAreaRef.current) {
            return;
        }

        const start = textAreaRef.current.selectionStart;
        const end = textAreaRef.current.selectionEnd;

        const lineStart = text.lastIndexOf("\n", start - 1) + 1;
        let lineEnd = text.indexOf("\n", end);
        lineEnd = lineEnd === -1 ? text.length : lineEnd + 1;

        const lineContent = text.substring(lineStart, lineEnd);

        insertFormatting(
            (start) => ({ start: start, end: start }), 
            (before, _selectedText, after) => before + after,
            { start: lineStart, end: lineEnd });

        try {
            await navigator.clipboard.writeText(lineContent);
        }
        catch (err) {
            console.error("Failed to copy: ", err);
        }
    }

    function insertFormatting(
        offsetSelection: number | ((start: number, end: number) => { start: number, end: number }),
        inserter: (before: string, selectedText: string, after: string) => string,
        range?: { start: number, end: number },
    ) {
        if (!textAreaRef.current) {
            return;
        }

        const start = range ? range.start : textAreaRef.current.selectionStart;
        const end = range ? range.end : textAreaRef.current.selectionEnd;

        const oldText = text;
        const selectedText = oldText.substring(start, end);
        const before = oldText.substring(0, start);
        const after = oldText.substring(end, oldText.length);
        const newText = inserter(before, selectedText, after);

        if (newText === oldText) {
            return;
        }

        let newStart: number;
        let newEnd: number;

        if (typeof offsetSelection === "function") {
            ({ start: newStart, end: newEnd } = offsetSelection(start, end));
        }
        else {
            newStart = start + offsetSelection;
            newEnd = end + offsetSelection;
        }

        setText(newText);
        setTextChanged(true);

        setSelection({ start: newStart, end: newEnd });

        textAreaRef.current.focus();
    }

    return {
        insertFormatting,
        insertTab,
        removeTab,
        indent,
        outdent,
        insertBold,
        insertItalic,
        insertInlineCode,
        insertLink,
        insertImage,
        cutLine,
    };
}

function smartSetRangeText(textArea: HTMLTextAreaElement, oldText: string, newText: string) {
    let start = 0;
    let endOld = oldText.length;
    let endNew = newText.length;

    while (start < endOld && start < endNew && oldText[start] === newText[start]) {
        start++;
    }

    while (
        endOld > start &&
        endNew > start &&
        oldText[endOld - 1] === newText[endNew - 1]
    ) {
        endOld--;
        endNew--;
    }

    const replacementPart = newText.slice(start, endNew);

    textArea.setRangeText(replacementPart, start, endOld, "preserve");
};