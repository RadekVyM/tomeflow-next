import { useEffect, useState } from "react";
import { cn } from "../utils/tailwind";
import LoadingIcon from "./LoadingIcon";

export default function SyncingIndicator(props: {
    className?: string,
    isSyncing: boolean,
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (props.isSyncing) {
            setIsVisible(true);
            return;
        }

        const timeout = setTimeout(() => setIsVisible(false), 1500);
        return () => clearTimeout(timeout);
    }, [props.isSyncing]);

    return (
        <div
            className={cn("text-xs text-primary dark:text-primary-dim flex items-center mr-2 transition-all duration-500 ease-in-out", !isVisible && "opacity-0 translate-y-0.5", props.className)}>
            <LoadingIcon
                className="w-2.5 h-2.5 mr-1" />
            <span className="mt-px">Syncing</span>
        </div>
    );
}