import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import Skeleton from "@/app/components/skeleton/Skeleton";
import { cn } from "@/app/utils/tailwind";

export default function DocumentsBoardsSkeleton() {
    return (
        <section>
            <Skeleton
                className="font-semibold text-2xl mb-5 mt-9 max-w-32" />

            <Skeleton
                className="border border-transparent rounded-lg w-full mb-6 h-9 box-content" />

            <CardListSkeleton
                withIcon
                itemsCount={5} />
        </section>
    );
}

function ItemsSectionSkeleton(props: {
    className?: string,
    headingClassName?: string,
    itemsCount?: number,
}) {
    return (
        <section
            className={props.className}>
            <Skeleton
                className={cn("font-semibold text-2xl mb-4", props.headingClassName)} />

            <CardListSkeleton
                withIcon
                itemsCount={props.itemsCount} />
        </section>
    );
}