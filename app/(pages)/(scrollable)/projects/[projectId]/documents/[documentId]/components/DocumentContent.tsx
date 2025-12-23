"use client";

import { updateDocumentContentAction } from "@/app/actions/documents";
import MarkdownPreviewer from "@/app/components/MarkdownPreviewer";
import { isNullOrWhiteSpace } from "@/app/utils/string";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

export default function DocumentContent(props: {
    className?: string,
    content: string,
    projectId: string,
    documentId: string,
}) {
    const [editable, setEditable] = useState(isNullOrWhiteSpace(props.content));
    const action = useAction(updateDocumentContentAction);

    return (
        <MarkdownPreviewer
            className={props.className}
            text={props.content}
            isSavePending={action.isPending}
            editable={editable}
            setEditable={setEditable}
            editorType="preview-first"
            onSave={(text) => action.execute({ id: props.documentId, content: text })}
            projectId={props.projectId} />
    );
}