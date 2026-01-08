import Breadcrumbs from "@/app/components/Breadcrumbs";
import PageHeading from "@/app/components/layout/PageHeading";
import { getDocument } from "@/app/services/documents";
import { getProject } from "@/app/services/projects";
import MoreButton from "./components/MoreButton";
import DocumentContent from "./components/DocumentContent";
import { cache, Suspense } from "react";
import { getSessionCached } from "@/app/utils/session";
import BreadcrumbsSkeleton from "@/app/components/skeleton/BreadcrumbsSkeleton";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import PageHeadingSkeleton from "@/app/components/skeleton/PageHeadingSkeleton";
import ScrollablePageLayout from "@/app/components/layout/ScrollablePageLayout";
import DocumentContentSkeleton from "./components/DocumentContentSkeleton";
import { notFound } from "next/navigation";

const getProjectCached = cache(async (projectId: string) => {
    const session = await getSessionCached();
    const project = await getProject(session.user.id, projectId);

    if (!project) {
        notFound();
    }

    return project;
});

const getDocumentCached = cache(async (documentId: string) => {
    const session = await getSessionCached();
    const document = await getDocument(session.user.id, documentId);

    if (!document) {
        notFound();
    }

    return document;
});

export default async function Page(props: {
    params: Promise<{ projectId: string, documentId: string }>
}) {
    const params = await props.params;

    return (
        <ScrollablePageLayout
            breadcrumbs={
                <Suspense
                    fallback={<BreadcrumbsSkeleton loadedItemsCount={1} />}>
                    <SuspendedBreadcrumbs
                        projectId={params.projectId} />
                </Suspense>}
            pageHeading={
                <Suspense
                    fallback={<PageHeadingSkeleton className="max-w-60" />}>
                    <SuspendedPageHeading
                        documentId={params.documentId} />
                </Suspense>}
            actionButtons={
                <ActionButtons
                    id="lg"
                    documentId={params.documentId} />}
            smActionButtons={
                <ActionButtons
                    id="sm"
                    documentId={params.documentId} />}>

            <Suspense
                fallback={<DocumentContentSkeleton />}>
                <SuspendedDocumentContent
                    projectId={params.projectId}
                    documentId={params.documentId} />
            </Suspense>
        </ScrollablePageLayout>
    );
}

function ActionButtons(props: {
    documentId: string,
    id: string,
}) {
    const id = `${props.id}-document-more`;

    return (
        <Suspense
            fallback={
                <MoreDropdownButton
                    id={id}
                    size="sm"
                    disabled />}>
            <SuspendedActionButtons
                id={id}
                documentId={props.documentId}/>
        </Suspense>
    );
}

async function SuspendedBreadcrumbs(props: {
    projectId: string,
}) {
    const project = await getProjectCached(props.projectId);

    return (
        <Breadcrumbs
            locations={[
                { href: "/", title: "Home" },
                { href: "/projects", title: "Projects" },
                { href: `/projects/${props.projectId}`, title: project.title },
            ]} />
    );
}

async function SuspendedPageHeading(props: {
    documentId: string,
}) {
    const document = await getDocumentCached(props.documentId);

    return (
        <PageHeading>
            {document.title}
        </PageHeading>
    );
}

async function SuspendedActionButtons(props: {
    documentId: string,
    id: string,
}) {
    const document = await getDocumentCached(props.documentId);

    return (
        <MoreButton
            id={props.id}
            documentId={props.documentId}
            documentTitle={document.title} />
    );
}

async function SuspendedDocumentContent(props: {
    projectId: string,
    documentId: string,
}) {
    const document = await getDocumentCached(props.documentId);

    return (
        <DocumentContent
            content={document.content}
            projectId={props.projectId}
            documentId={props.documentId} />
    );
}