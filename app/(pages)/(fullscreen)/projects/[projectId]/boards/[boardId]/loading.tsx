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
                className="mb-3"
                withFallbackUserButton>
                <div
                    className="grid grid-cols-[calc(100%-var(--spacing)*9)_auto] items-start mt-1.5">
                    <div
                        className="flex-1">
                        <BreadcrumbsSkeleton loadedItemsCount={2} />
                        <PageHeadingSkeleton className="max-w-60 mt-3" />
                    </div>

                    <MoreDropdownButton
                        id="board-more"
                        disabled />
                </div>
            </Header>

            <section
                className="flex-1 overflow-x-auto overflow-y-hidden">
                <BoardSkeleton />
            </section>
        </div>
    );
}