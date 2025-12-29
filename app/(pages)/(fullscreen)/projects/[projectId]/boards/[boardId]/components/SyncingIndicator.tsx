"use client";

import { useContext, useEffect, useState } from "react";
import { BoardPageContext } from "./BoardPageContext";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { cn } from "@/app/utils/tailwind";

export default function SyncingIndicator(props: {
    className?: string,
}) {
    const { isSyncing } = useContext(BoardPageContext);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isSyncing) {
            setIsVisible(true);
            return;
        }

        const timeout = setTimeout(() => setIsVisible(false), 1500);
        return () => clearTimeout(timeout);
    }, [isSyncing]);

    return (
        <div
            className={cn("text-xs text-primary flex items-center mr-2 transition-all duration-500 ease-in-out", !isVisible && "opacity-0 translate-y-0.5", props.className)}>
            <LoadingSpinner
                className="scale-30 -ml-0.5 -mr-1.5 -my-1 text-primary" />
            <span className="mt-px">Syncing</span>
        </div>
    );
}