import Breadcrumbs from "@/app/components/Breadcrumbs";
import PageHeading from "@/app/components/layout/PageHeading";
import PageLayout from "@/app/components/layout/PageLayout";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import NewProjectButtonSkeleton from "@/app/components/skeleton/NewProjectButtonSkeleton";

export default function Loading() {
    return (
        <PageLayout
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
                        id="projects-more"
                        size="sm"
                        disabled />
                </>}>

            <CardListSkeleton withIcon itemsCount={5} />
        </PageLayout>
    );
}