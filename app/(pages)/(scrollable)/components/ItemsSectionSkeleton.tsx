import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import Skeleton from "@/app/components/skeleton/Skeleton";
import { cn } from "@/app/utils/tailwind";

export default function ItemsSectionSkeleton(props: {
    className?: string,
    headingClassName?: string,
    itemsCount?: number,
}) {
    return (
        <>
            <Skeleton
                className={cn("font-semibold text-2xl mb-4", props.headingClassName)} />

            <CardListSkeleton
                className="mb-8"
                withIcon
                withSubtitle
                itemsCount={props.itemsCount} />
        </>
    );
}