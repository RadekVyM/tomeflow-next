"use client";

import React, { createContext, useState } from "react";

type ProjectPageContext = {
    descriptionEditable: boolean,
    description: string | null,
    setDescriptionEditable: React.Dispatch<React.SetStateAction<boolean>>,
    setDescription: (value: string | null) => void,
}

export const ProjectPageContext = createContext<ProjectPageContext>({
    descriptionEditable: false,
    description: null,
    setDescriptionEditable: () => {},
    setDescription: () => {},
});

export function ProjectPageContextProvider(props: {
    children: React.ReactNode,
}) {
    const [descriptionEditable, setDescriptionEditable] = useState(false);
    const [description, setDescription] = useState<string | null>(null);

    return (
        <ProjectPageContext.Provider
            value={{
                descriptionEditable,
                description,
                setDescriptionEditable,
                setDescription,
            }}>
            {props.children}
        </ProjectPageContext.Provider>
    );
}