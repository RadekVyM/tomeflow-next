"use client";

import { useContext, useEffect } from "react";
import { ProjectPageContext } from "@/app/(pages)/(with-sidebar)/(scrollable)/projects/[projectId]/(project)/components/ProjectPageContext";
import MarkdownPreview from "@/app/components/markdown/MarkdownPreview";
import MarkdownEditorDialog from "@/app/components/markdown/MarkdownEditorDialog";
import { useAction } from "next-safe-action/hooks";
import toast from "@/app/components/toast";
import { updateProjectDescriptionAction } from "@/app/actions/projects";

export default function ProjectDescription(props: {
    className?: string,
    description: string | null,
    projectId: string,
}) {
    const { dialogState, description, setDescription } = useContext(ProjectPageContext);
    const action = useAction(updateProjectDescriptionAction, {
        onError: () => toast("Failed to update the project description"),
    });

    useEffect(() => {
        setDescription(props.description);
    }, [props.description]);

    return (
        <>
            <MarkdownPreview
                text={props.description || ""}
                className={props.className}
                onReplaceClick={dialogState?.show} />

            {dialogState &&
                <MarkdownEditorDialog
                    state={dialogState}
                    text={description || undefined}
                    isSavePending={action.isPending}
                    onSave={(text) => {
                        setDescription(text);
                        action.execute({ id: props.projectId, description: text });
                    }}
                    projectId={props.projectId} />}
        </>
    );
}