"use client";

import { useContext } from "react";
import { BoardPageContext } from "./BoardPageContext";
import SyncingIndicator from "@/app/components/SyncingIndicator";

export default function BoardSyncingIndicator(props: {
    className?: string,
}) {
    const { isSyncing } = useContext(BoardPageContext);

    return (
        <SyncingIndicator
            isSyncing={isSyncing}
            className={props.className} />
    );
}