"use client";

import useIsClient from "@/app/hooks/useIsClient";
import { formatRelativeTime } from "@/app/utils/date";
import { useEffect, useState } from "react";
import Skeleton from "../skeleton/Skeleton";

export default function CardListItemTime(props: {
    time: Date,
}) {
    const isClient = useIsClient();
    const [timeKey, setTimeKey] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const key = Math.random().toString();
            setTimeKey(key);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    if (!isClient) {
        return (
            <Skeleton
                className="text-xs max-w-24" />
        );
    }

    return (
        <small
            className="text-xs text-on-surface-container-muted"
            key={timeKey}>
            {isClient && `Seen ${formatRelativeTime(new Date(props.time))}`}
        </small>
    );
}