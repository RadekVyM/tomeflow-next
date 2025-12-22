import { cn } from "@/app/utils/tailwind";
import Skeleton from "./Skeleton";

export default function PageHeadingSkeleton(props: {
    className?: string,
}) {
    return (
        <Skeleton
            className={cn("text-4xl font-semibold", props.className)} />
    );
}