import PageLayout from "@/app/components/layout/PageLayout";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import BreadcrumbsSkeleton from "@/app/components/skeleton/BreadcrumbsSkeleton";
import PageHeadingSkeleton from "@/app/components/skeleton/PageHeadingSkeleton";
import DocumentContentSkeleton from "./components/DocumentContentSkeleton";

export default function Loading() {
    return (
        <PageLayout
            breadcrumbs={<BreadcrumbsSkeleton loadedItemsCount={1} />}
            pageHeading={<PageHeadingSkeleton className="max-w-60" />}
            actionButtons={
                <MoreDropdownButton
                    id="document-more"
                    size="sm"
                    disabled />}>

            <DocumentContentSkeleton />
        </PageLayout>
    );
}