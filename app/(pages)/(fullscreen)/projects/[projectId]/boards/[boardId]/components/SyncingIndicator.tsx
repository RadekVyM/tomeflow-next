"use client";

import { useContext } from "react";
import { BoardPageContext } from "./BoardPageContext";
import { LuCircleCheck } from "react-icons/lu";

export default function SyncingIndicator() {
    const { isSyncing } = useContext(BoardPageContext);

    if (!isSyncing) {
        return undefined;
    }

    return (
        <div
            className="text-sm text-on-surface-muted flex items-center gap-1 mr-2">
            <LuCircleCheck />
            <span className="mt-0.5">{isSyncing ? "Syncing..." : "Synced"}</span>
        </div>
    );
}