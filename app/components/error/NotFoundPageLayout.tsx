import Breadcrumbs from "@/app/components/Breadcrumbs";
import PageHeading from "@/app/components/layout/PageHeading";
import ScrollablePageLayout from "@/app/components/layout/ScrollablePageLayout";

export default function NotFoundPageLayout() {
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
                    Oh no! Error 404
                </PageHeading>}>

            <p
                className="text-xl font-semibold mb-2">
                Page not found
            </p>

            <p
                className="text-on-surface-muted mb-8">
                The page you are looking for doesn't seem to exist...
            </p>
        </ScrollablePageLayout>
    );
}