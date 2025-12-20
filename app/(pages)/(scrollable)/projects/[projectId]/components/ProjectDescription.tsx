"use client";

import { useContext } from "react";
import MarkdownPreviewer from "../../../../../components/MarkdownPreviewer";
import { ProjectPageContext } from "@/app/(pages)/(scrollable)/projects/[projectId]/components/ProjectPageContext";
import { updateProjectDescriptionAction } from "@/app/actions/projects";
import { useAction } from "next-safe-action/hooks";

export default function ProjectDescription(props: {
    className?: string,
    description: string | null,
    projectId: string,
}) {
    const { descriptionEditable, setDescriptionEditable } = useContext(ProjectPageContext);
    const action = useAction(updateProjectDescriptionAction);

    return (
        <MarkdownPreviewer
            editButtonHidden
            editable={descriptionEditable}
            isSavePending={action.isPending}
            setEditable={setDescriptionEditable}
            text={props.description || undefined}
            className={props.className}
            editorType="editor-first"
            onSave={(text) => action.execute({ id: props.projectId, description: text })}
            projectId={props.projectId} />
    );
}