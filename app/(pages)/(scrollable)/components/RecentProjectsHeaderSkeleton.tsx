import Skeleton from "@/app/components/skeleton/Skeleton";

export default function RecentProjectsHeaderSkeleton() {
    return (
        <div
            className="flex justify-between items-start mb-4">
            <Skeleton
                className="font-semibold text-2xl max-w-48" />

            <div
                className="flex gap-2">
                <Skeleton
                    className="h-7 w-30 max-sm:w-7" />
                <Skeleton
                    className="h-7 w-28 max-sm:w-7" />
            </div>
        </div>
    );
}