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

    function insertFormatting(
        offsetSelection: number | ((start: number, end: number) => { start: number, end: number }),
        inserter: (before: string, selectedText: string, after: string) => string,
    ) {
        if (!textAreaRef.current) {
            return;
        }

        const start = textAreaRef.current.selectionStart;
        const end = textAreaRef.current.selectionEnd;

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
        } else {
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
        insertBold,
        insertItalic,
        insertInlineCode,
        insertLink,
        insertImage,
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