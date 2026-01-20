import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import BreadcrumbsSkeleton from "@/app/components/skeleton/BreadcrumbsSkeleton";
import PageHeadingSkeleton from "@/app/components/skeleton/PageHeadingSkeleton";
import BoardSkeleton from "./components/BoardSkeleton";
import FullscreenPageLayout from "@/app/components/layout/FullscreenPageLayout";

export default function Loading() {
    return (
        <FullscreenPageLayout
            breadcrumbs={<BreadcrumbsSkeleton loadedItemsCount={1} />}
            pageHeading={<PageHeadingSkeleton className="max-w-60 mt-1 text-3xl" />}
            actionButtons={
                <MoreDropdownButton
                    id="lg-board-more"
                    disabled />}
            smActionButtons={
                <MoreDropdownButton
                    id="sm-board-more"
                    disabled />}>

            <section
                className="flex-1 overflow-x-auto overflow-y-hidden mt-px">
                <BoardSkeleton />
            </section>
        </FullscreenPageLayout>
    );
}