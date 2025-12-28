import Button from "@/app/components/input/Button";
import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import NewProjectButtonSkeleton from "@/app/components/skeleton/NewProjectButtonSkeleton";
import ItemsSectionSkeleton from "./components/ItemsSectionSkeleton";
import TimeSkeleton from "@/app/components/skeleton/TimeSkeleton";
import RecentProjectsHeaderSkeleton from "./components/RecentProjectsHeaderSkeleton";

export default function Loading() {
    return (
        <>
            <TimeSkeleton
                className="mb-8" />

            <div
                className="flex-1 flex flex-col gap-8">
                <section>
                    <RecentProjectsHeaderSkeleton />
                    <CardListSkeleton className="mb-8" withIcon itemsCount={3} />
                </section>

                <ItemsSectionSkeleton headingClassName="max-w-48" itemsCount={2} />

                <ItemsSectionSkeleton headingClassName="max-w-56" itemsCount={5} />
            </div>
        </>
    );
}