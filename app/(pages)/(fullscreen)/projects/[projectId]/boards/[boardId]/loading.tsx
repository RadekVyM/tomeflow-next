import Header from "@/app/components/layout/Header";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import BreadcrumbsSkeleton from "@/app/components/skeleton/BreadcrumbsSkeleton";
import PageHeadingSkeleton from "@/app/components/skeleton/PageHeadingSkeleton";
import BoardSkeleton from "./components/BoardSkeleton";

export default function Loading() {
    return (
        <div
            className="flex flex-col h-dvh max-h-dvh overflow-hidden">
            <Header
                className="mb-1 items-end"
                leading={
                    <BreadcrumbsSkeleton loadedItemsCount={1} />}
                withFallbackUserButton>
                <div
                    className="flex justify-between pr-1">
                    <PageHeadingSkeleton className="max-w-60 mt-1" />

                    <div
                        className="flex items-center gap-4">
                        <MoreDropdownButton
                            id="board-more"
                            size="sm"
                            disabled />
                    </div>
                </div>
            </Header>

            <section
                className="flex-1 overflow-x-auto overflow-y-hidden">
                <BoardSkeleton />
            </section>
        </div>
    );
}