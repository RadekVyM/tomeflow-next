import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import Skeleton from "@/app/components/skeleton/Skeleton";

export default function DocumentsBoardsSkeleton() {
    return (
        <section>
            <Skeleton
                className="font-semibold text-2xl mb-5 mt-9 max-w-32" />

            <Skeleton
                className="border border-transparent rounded-lg w-full mb-5 h-9 box-content" />

            <Skeleton
                className="text-sm font-semibold mb-3 max-w-16" />

            <CardListSkeleton
                withIcon
                itemsCount={5} />
        </section>
    );
}