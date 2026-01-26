"use client";

import useDialog from "@/app/hooks/useDialog";
import { DialogState } from "@/app/types/DialogState";
import React, { createContext, useState } from "react";

type ProjectPageContext = {
    dialogState: DialogState | null,
    description: string | null,
    setDescription: (value: string | null) => void,
}

export const ProjectPageContext = createContext<ProjectPageContext>({
    dialogState: null,
    description: null,
    setDescription: () => {},
});

export function ProjectPageContextProvider(props: {
    children: React.ReactNode,
}) {
    const dialogState = useDialog();
    const [description, setDescription] = useState<string | null>(null);

    return (
        <ProjectPageContext.Provider
            value={{
                dialogState,
                description,
                setDescription,
            }}>
            {props.children}
        </ProjectPageContext.Provider>
    );
}