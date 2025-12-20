"use client";

import React, { createContext, useState } from "react";

type ProjectPageContext = {
    descriptionEditable: boolean,
    setDescriptionEditable: React.Dispatch<React.SetStateAction<boolean>>,
}

export const ProjectPageContext = createContext<ProjectPageContext>({
    descriptionEditable: false,
    setDescriptionEditable: () => {},
});

export function ProjectPageContextProvider(props: {
    children: React.ReactNode,
}) {
    const [descriptionEditable, setDescriptionEditable] = useState(false);

    return (
        <ProjectPageContext.Provider
            value={{
                descriptionEditable,
                setDescriptionEditable,
            }}>
            {props.children}
        </ProjectPageContext.Provider>
    );
}