import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import Skeleton from "@/app/components/skeleton/Skeleton";
import { cn } from "@/app/utils/tailwind";

export default function DocumentsBoardsSkeleton() {
    return (
        <>
            <ItemsSectionSkeleton
                className="mt-8"
                headingClassName="max-w-28"
                itemsCount={2} />
            <ItemsSectionSkeleton
                className="mt-8"
                headingClassName="max-w-36"
                itemsCount={3} />
        </>
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
                className={cn("font-semibold text-3xl mb-4", props.headingClassName)} />

            <CardListSkeleton
                withIcon
                itemsCount={props.itemsCount} />
        </section>
    );
}