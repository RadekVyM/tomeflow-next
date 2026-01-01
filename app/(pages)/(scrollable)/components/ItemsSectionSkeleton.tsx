import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import Skeleton from "@/app/components/skeleton/Skeleton";
import { cn } from "@/app/utils/tailwind";

export default function ItemsSectionSkeleton(props: {
    className?: string,
    headingClassName?: string,
    itemsCount?: number,
}) {
    return (
        <section
            className={props.className}>
            <Skeleton
                className={cn("font-semibold text-2xl mb-5 mt-1", props.headingClassName)} />

            <CardListSkeleton
                withIcon
                withSubtitle
                itemsCount={props.itemsCount} />
        </section>
    );
}