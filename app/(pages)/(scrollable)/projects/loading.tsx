import PageHeading from "@/app/components/layout/PageHeading";
import PageLayout from "@/app/components/layout/PageLayout";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import BreadcrumbsSkeleton from "@/app/components/skeleton/BreadcrumbsSkeleton";
import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import NewProjectButtonSkeleton from "@/app/components/skeleton/NewProjectButtonSkeleton";

export default function Loading() {
    return (
        <PageLayout
            breadcrumbs={<BreadcrumbsSkeleton loadedItemsCount={0} />}
            pageHeading={
                <PageHeading>
                    Projects
                </PageHeading>}
            actionButtons={
                <>
                    <NewProjectButtonSkeleton />
                    <MoreDropdownButton
                        id="projects-more"
                        disabled />
                </>}>

            <CardListSkeleton withIcon itemsCount={5} />
        </PageLayout>
    );
}