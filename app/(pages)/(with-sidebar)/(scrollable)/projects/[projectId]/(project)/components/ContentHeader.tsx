"use client";

import { cn } from "@/app/utils/tailwind";
import { useContext } from "react";
import { ProjectPageContext } from "./ProjectPageContext";

export default function ContentHeader(props: {
    hasHeading?: boolean,
}) {
    const { descriptionEditable } = useContext(ProjectPageContext);

    const showHeading = props.hasHeading || descriptionEditable;

    return (
        <h3
            className={cn("font-semibold text-2xl mb-4", !showHeading && "sr-only", showHeading && "mt-8")}>
            Content
        </h3>
    );
}