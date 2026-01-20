import ScrollablePageLayout from "@/app/components/layout/ScrollablePageLayout";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import BreadcrumbsSkeleton from "@/app/components/skeleton/BreadcrumbsSkeleton";
import PageHeadingSkeleton from "@/app/components/skeleton/PageHeadingSkeleton";
import DocumentContentSkeleton from "./components/DocumentContentSkeleton";

export default function Loading() {
    return (
        <ScrollablePageLayout
            breadcrumbs={<BreadcrumbsSkeleton loadedItemsCount={1} />}
            pageHeading={<PageHeadingSkeleton className="max-w-60" />}
            actionButtons={
                <MoreDropdownButton
                    id="lg-document-more"
                    disabled />}
            smActionButtons={
                <MoreDropdownButton
                    id="sm-document-more"
                    disabled />}>

            <DocumentContentSkeleton />
        </ScrollablePageLayout>
    );
}