"use client";

import Breadcrumbs from "@/app/components/Breadcrumbs";
import PageHeading from "@/app/components/layout/PageHeading";
import PageLayout from "@/app/components/layout/PageLayout";
import ErrorPageContent from "./ErrorPageContent";

export default function ErrorPageLayout(props: {
    error: Error & { digest?: string },
    reset: () => void,
}) {
    return (
        <PageLayout
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
        </PageLayout>
    );
}