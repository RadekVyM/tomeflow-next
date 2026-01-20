import Skeleton from "@/app/components/skeleton/Skeleton";
import AddSectionButton from "./AddSectionButton";

export default function BoardSkeleton() {
    return (
        <div
            className="h-full w-fit pb-4 px-4 flex gap-3 isolate">
            <Skeleton
                className="min-w-72 max-w-72 h-full rounded-2xl" />
            <Skeleton
                className="min-w-72 max-w-72 h-full rounded-2xl" />

            <AddSectionButton
                disabled />
        </div>
    );
}