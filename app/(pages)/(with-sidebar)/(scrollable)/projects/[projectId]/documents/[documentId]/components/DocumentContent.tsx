"use client";

import { updateDocumentContentAction } from "@/app/actions/documents";
import MarkdownEditorDialog from "@/app/components/markdown/MarkdownEditorDialog";
import MarkdownPreview from "@/app/components/markdown/MarkdownPreview";
import toast from "@/app/components/toast";
import { useAction } from "next-safe-action/hooks";
import { useContext } from "react";
import { DocumentPageContext } from "./DocumentPageContextProvider";
import { isNullOrWhiteSpace } from "@/app/utils/string";
import { TbFile } from "react-icons/tb";
import EditButton from "./EditButton";

export default function DocumentContent(props: {
    className?: string,
    content: string,
    projectId: string,
    documentId: string,
}) {
    const { dialogState } = useContext(DocumentPageContext);
    const action = useAction(updateDocumentContentAction, {
        onError: () => toast("Failed to update the document content"),
    });

    return (
        <>
            {isNullOrWhiteSpace(props.content) ?
                <EmptyDocument /> :
                <MarkdownPreview
                    className={props.className}
                    text={props.content}
                    onReplaceClick={dialogState?.show} />}

            {dialogState &&
                <MarkdownEditorDialog
                    state={dialogState}
                    text={props.content}
                    isSavePending={action.isPending}
                    onSave={(text) => action.execute({ id: props.documentId, content: text })}
                    projectId={props.projectId} />}
        </>
    );
}

function EmptyDocument() {
    return (
        <section
            className="flex-1 mb-10 mx-auto flex flex-col items-center justify-center">
            <TbFile
                className="w-12 h-12 text-on-surface-muted mb-4" />

            <div className="w-fit text-on-surface text-lg font-semibold text-center">Oops! This document is empty...</div>
            <div className="w-fit text-on-surface-muted text-sm text-center mb-5">Please edit the document.</div>

            <EditButton
                nondynamic />
        </section>
    );
}