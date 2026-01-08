"use client";

import Breadcrumbs from "@/app/components/Breadcrumbs";
import PageHeading from "@/app/components/layout/PageHeading";
import ScrollablePageLayout from "@/app/components/layout/ScrollablePageLayout";
import ErrorPageContent from "./ErrorPageContent";

export default function ErrorPageLayout(props: {
    error: Error & { digest?: string },
    reset: () => void,
}) {
    return (
        <ScrollablePageLayout
            breadcrumbs={
                <Breadcrumbs
                    locations={[
                        { href: "/", title: "Home" },
                        { href: "/projects", title: "Projects" },
                    ]} />}
            pageHeading={
                <PageHeading>
                    Oh no!
                </PageHeading>}>

            <ErrorPageContent
                {...props} />
        </ScrollablePageLayout>
    );
}