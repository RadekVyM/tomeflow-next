"use client";

import useDialog from "@/app/hooks/useDialog";
import { DialogState } from "@/app/types/DialogState";
import React, { createContext } from "react";

type DocumentPageContext = {
    dialogState: DialogState | null,
}

export const DocumentPageContext = createContext<DocumentPageContext>({
    dialogState: null,
});

export function DocumentPageContextProvider(props: {
    children: React.ReactNode,
}) {
    const dialogState = useDialog();

    return (
        <DocumentPageContext.Provider
            value={{
                dialogState,
            }}>
            {props.children}
        </DocumentPageContext.Provider>
    );
}