import Breadcrumbs from "@/app/components/Breadcrumbs";
import PageHeading from "@/app/components/layout/PageHeading";
import ScrollablePageLayout from "@/app/components/layout/ScrollablePageLayout";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import NewProjectButtonSkeleton from "@/app/components/skeleton/NewProjectButtonSkeleton";

export default function Loading() {
    return (
        <ScrollablePageLayout
            breadcrumbs={
                <Breadcrumbs
                    locations={[
                        { href: "/", title: "Home" },
                    ]} />}
            pageHeading={
                <PageHeading>
                    Projects
                </PageHeading>}
            actionButtons={
                <>
                    <NewProjectButtonSkeleton
                        size="sm" />
                    <MoreDropdownButton
                        id="lg-projects-more"
                        size="sm"
                        disabled />
                </>}
            smActionButtons={
                <>
                    <NewProjectButtonSkeleton
                        size="sm" />
                    <MoreDropdownButton
                        id="sm-projects-more"
                        size="sm"
                        disabled />
                </>}>

            <CardListSkeleton withIcon itemsCount={5} />
        </ScrollablePageLayout>
    );
}