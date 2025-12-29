import { cn } from "@/app/utils/tailwind";
import Skeleton from "./Skeleton";

export default function CardListItemSkeleton(props: {
    className?: string,
    withIcon?: boolean,
    withSubtitle?: boolean,
}) {
    return (
        <Skeleton
            className={cn("w-full h-full flex flex-col justify-between gap-0 items-start py-3 px-4", props.withIcon && "pb-2", props.className)}>
            <div
                className="mb-1">
                <div
                    className="text-lg font-semibold leading-5 h-[1em]" />
                {props.withSubtitle &&
                    <div
                        className="text-sm font-semibold mt-0.5 h-[1em]" />}
            </div>
            <div
                className="flex items-center justify-between w-full gap-2">
                <div
                    className="text-xs h-[1em]" />
                {props.withIcon &&
                    <div
                        className="p-1.5 -mr-1">
                        <div
                            className="w-3.5 h-3.5" />
                    </div>}
            </div>
        </Skeleton>
    );
}