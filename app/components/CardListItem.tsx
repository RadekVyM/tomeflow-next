import { useEffect, useState } from "react";
import { formatRelativeTime } from "../utils/date";
import { cn } from "../utils/tailwind";
import Button from "./Button";
import type { IconType } from "react-icons";

export default function CardListItem(props: {
    className?: string,
    innerClassName?: string,
    href?: string,
    title: React.ReactNode,
    subtitle?: React.ReactNode,
    lastSeenDate: Date,
    titleAs?: "h2" | "h3" | "h4" | "h5",
    icon?: IconType,
}) {
    const [timeKey, setTimeKey] = useState("");

    const Icon = props.icon;
    const Title = props.titleAs || "h3";

    useEffect(() => {
        const interval = setInterval(() => {
            const key = Math.random().toString();
            setTimeKey(key);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <li
            className={props.className}>
            <Button
                variant="container"
                className={cn("w-full h-full flex flex-col justify-between gap-0 items-start py-3 px-4", Icon && "pb-2", props.innerClassName)}
                href={props.href}>
                <div
                    className="mb-1.5">
                    <Title
                        className="text-lg font-semibold text-on-surface-container leading-5 line-clamp-2">
                        {props.title}
                    </Title>
                    {props.subtitle &&
                        <span
                            className="text-sm font-semibold text-on-surface-container-muted line-clamp-1 mt-1">
                            {props.subtitle}
                        </span>}
                </div>
                <div
                    className="flex items-center justify-between w-full gap-2">
                    <small
                        className="text-xs text-on-surface-container-muted"
                        key={timeKey}>
                        Seen {formatRelativeTime(props.lastSeenDate)}
                    </small>
                    {Icon &&
                        <div
                            className="bg-primary-lite p-1.5 rounded-lg -mr-1">
                            <Icon
                                className="text-primary w-3.5 h-3.5" />
                        </div>}
                </div>
            </Button>
        </li>
    );
}