import PageLayout from "@/app/components/layout/PageLayout";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import BreadcrumbsSkeleton from "@/app/components/skeleton/BreadcrumbsSkeleton";
import PageHeadingSkeleton from "@/app/components/skeleton/PageHeadingSkeleton";
import NewDocumentButton from "./components/NewDocumentButton";
import ParagraphSkeleton from "@/app/components/skeleton/ParagraphSkeleton";
import ContentSkeleton from "./components/DocumentsBoardsSkeleton";

export default function Loading() {
    return (
        <PageLayout
            breadcrumbs={<BreadcrumbsSkeleton loadedItemsCount={0} />}
            pageHeading={<PageHeadingSkeleton className="max-w-60" />}
            actionButtons={
                <>
                    <NewDocumentButton
                        projectId={""}
                        disabled />
                    <MoreDropdownButton
                        id="project-more"
                        size="sm"
                        disabled />
                </>}>

            <ParagraphSkeleton />
            <ContentSkeleton />
        </PageLayout>
    );
}