import { cn } from "@/app/utils/tailwind";
import Skeleton from "./Skeleton";

export default function ParagraphSkeleton(props: {
    className?: string,
    lastParagraphWidth?: "w-1/4" | "w-1/2" | "w-3/4" | "w-2/3",
}) {
    const lastParagraphWidth = props.lastParagraphWidth || "w-3/4";

    return (
        <div
            className={cn("flex flex-col gap-1", props.className)}>
            <Skeleton />
            <Skeleton />
            <Skeleton
                className={lastParagraphWidth} />
        </div>
    );
}