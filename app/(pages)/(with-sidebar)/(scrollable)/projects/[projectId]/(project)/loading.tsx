import ScrollablePageLayout from "@/app/components/layout/ScrollablePageLayout";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import BreadcrumbsSkeleton from "@/app/components/skeleton/BreadcrumbsSkeleton";
import PageHeadingSkeleton from "@/app/components/skeleton/PageHeadingSkeleton";
import NewDocumentButton from "./components/NewDocumentButton";
import ParagraphSkeleton from "@/app/components/skeleton/ParagraphSkeleton";
import ContentSkeleton from "./components/DocumentsBoardsSkeleton";

export default function Loading() {
    return (
        <ScrollablePageLayout
            breadcrumbs={<BreadcrumbsSkeleton loadedItemsCount={0} />}
            pageHeading={<PageHeadingSkeleton className="max-w-60" />}
            actionButtons={
                <>
                    <NewDocumentButton
                        projectId={""}
                        disabled />
                    <MoreDropdownButton
                        id="lg-project-more"
                        size="sm"
                        disabled />
                </>}
            smActionButtons={
                <>
                    <NewDocumentButton
                        projectId={""}
                        disabled />
                    <MoreDropdownButton
                        id="sm-project-more"
                        size="sm"
                        disabled />
                </>}>

            <ParagraphSkeleton />
            <ContentSkeleton />
        </ScrollablePageLayout>
    );
}