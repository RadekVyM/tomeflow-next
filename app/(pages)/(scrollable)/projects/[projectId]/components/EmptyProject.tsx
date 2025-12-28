"use client";

import { LuBox } from "react-icons/lu";
import NewDocumentButton from "./NewDocumentButton";
import NewBoardButton from "./NewBoardButton";
import { useContext } from "react";
import { ProjectPageContext } from "./ProjectPageContext";
import { isNullOrWhiteSpace } from "@/app/utils/string";

export default function EmptyProject(props: {
    projectId: string,
}) {
    const { descriptionEditable, description } = useContext(ProjectPageContext);

    if (descriptionEditable || !isNullOrWhiteSpace(description)) {
        return undefined;
    }

    return (
        <section
            className="flex-1 mb-10 mx-auto flex flex-col items-center justify-center">
            <LuBox
                className="w-12 h-12 text-on-surface-muted mb-4" />

            <div className="w-fit text-on-surface text-lg font-semibold text-center">Oops! This project is empty...</div>
            <div className="w-fit text-on-surface-muted text-sm text-center mb-5">Please create a new document or board.</div>

            <div
                className="flex flex-wrap gap-2">
                <NewDocumentButton
                    nondynamic
                    projectId={props.projectId} />

                <NewBoardButton
                    projectId={props.projectId} />
            </div>
        </section>
    );
}