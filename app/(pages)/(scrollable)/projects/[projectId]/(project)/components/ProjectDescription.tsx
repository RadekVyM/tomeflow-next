"use client";

import { useContext } from "react";
import MarkdownPreviewer from "@/app/components/MarkdownPreviewer";
import { ProjectPageContext } from "@/app/(pages)/(scrollable)/projects/[projectId]/(project)/components/ProjectPageContext";
import { updateProjectDescriptionAction } from "@/app/actions/projects";
import { useAction } from "next-safe-action/hooks";
import toast from "@/app/components/toast";

export default function ProjectDescription(props: {
    className?: string,
    description: string | null,
    projectId: string,
}) {
    const { descriptionEditable, setDescriptionEditable, setDescription } = useContext(ProjectPageContext);
    const action = useAction(updateProjectDescriptionAction, {
        onError: () => toast("Failed to update the project description"),
    });

    return (
        <MarkdownPreviewer
            editButtonHidden
            editable={descriptionEditable}
            isSavePending={action.isPending}
            setEditable={setDescriptionEditable}
            text={props.description || undefined}
            className={props.className}
            editorType="editor-first"
            onSave={(text) => {
                setDescription(text);
                action.execute({ id: props.projectId, description: text });
            }}
            projectId={props.projectId} />
    );
}