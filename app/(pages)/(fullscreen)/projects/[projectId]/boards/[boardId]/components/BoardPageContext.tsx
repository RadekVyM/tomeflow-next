"use client";

import React, { createContext, useState } from "react";

type BoardPageContext = {
    isSyncing: boolean,
    setIsSyncing: React.Dispatch<React.SetStateAction<boolean>>,
}

export const BoardPageContext = createContext<BoardPageContext>({
    isSyncing: false,
    setIsSyncing: () => {},
});

export function BoardPageContextProvider(props: {
    children: React.ReactNode,
}) {
    const [isSyncing, setIsSyncing] = useState(false);

    return (
        <BoardPageContext.Provider
            value={{
                isSyncing,
                setIsSyncing,
            }}>
            {props.children}
        </BoardPageContext.Provider>
    );
}