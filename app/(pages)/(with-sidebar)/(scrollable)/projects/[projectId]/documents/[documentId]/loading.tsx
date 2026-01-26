import ScrollablePageLayout from "@/app/components/layout/ScrollablePageLayout";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import BreadcrumbsSkeleton from "@/app/components/skeleton/BreadcrumbsSkeleton";
import PageHeadingSkeleton from "@/app/components/skeleton/PageHeadingSkeleton";
import DocumentContentSkeleton from "./components/DocumentContentSkeleton";
import EditButton from "./components/EditButton";

export default function Loading() {
    return (
        <ScrollablePageLayout
            breadcrumbs={<BreadcrumbsSkeleton loadedItemsCount={1} />}
            pageHeading={<PageHeadingSkeleton className="max-w-60" />}
            actionButtons={
                <>
                    <EditButton
                        disabled />
                    <MoreDropdownButton
                        id="lg-document-more"
                        disabled />
                </>}
            smActionButtons={
                <>
                    <EditButton
                        disabled />
                    <MoreDropdownButton
                        id="sm-document-more"
                        disabled />
                </>}>

            <DocumentContentSkeleton />
        </ScrollablePageLayout>
    );
}