import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import RecentContentSkeleton from "../components/RecentContent";
import TimeSkeleton from "@/app/components/skeleton/TimeSkeleton";
import RecentProjectsHeaderSkeleton from "../components/RecentProjectsHeaderSkeleton";
import ScrollablePageLayout from "@/app/components/layout/ScrollablePageLayout";

export default function Loading() {
    return (
        <ScrollablePageLayout>
            <TimeSkeleton
                className="mb-8" />

            <div
                className="flex-1 flex flex-col gap-8">
                <section>
                    <RecentProjectsHeaderSkeleton />
                    <CardListSkeleton className="mb-8" withIcon itemsCount={3} />
                </section>

                <RecentContentSkeleton headingClassName="max-w-48" itemsCount={5} />
            </div>
        </ScrollablePageLayout>
    );
}