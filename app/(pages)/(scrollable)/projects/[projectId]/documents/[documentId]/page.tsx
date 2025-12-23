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
import ParagraphSkeleton from "@/app/components/skeleton/ParagraphSkeleton";
import PageHeadingSkeleton from "@/app/components/skeleton/PageHeadingSkeleton";

const getProjectCached = cache(async (projectId: string) => {
    const session = await getSessionCached();
    const project = await getProject(session.user.id, projectId);

    if (!project) {
        throw new Error("Project not found.");
    }

    return project;
});

const getDocumentCached = cache(async (documentId: string) => {
    const session = await getSessionCached();
    const document = await getDocument(session.user.id, documentId);

    if (!document) {
        throw new Error("Document not found.");
    }

    return document;
});

export default async function Page(props: {
    params: Promise<{ projectId: string, documentId: string }>
}) {
    const params = await props.params;

    return (
        <>
            <header
                className="mb-8">
                <Suspense
                    fallback={<BreadcrumbsSkeleton loadedItemsCount={2} />}>
                    <SuspendedBreadcrumbs
                        projectId={params.projectId}
                        documentId={params.documentId} />
                </Suspense>
                <div
                    className="flex justify-between items-start">
                    <Suspense
                        fallback={<PageHeadingSkeleton className="max-w-60" />}>
                        <SuspendedPageHeading
                            documentId={params.documentId} />
                    </Suspense>
                    <Suspense
                        fallback={
                            <MoreDropdownButton
                                id="document-more"
                                disabled />}>
                        <SuspendedActionButtons
                            documentId={params.documentId}/>
                    </Suspense>
                </div>
            </header>

            <Suspense
                fallback={
                    <article
                        className="markdown">
                        <ParagraphSkeleton
                            className="mb-3"
                            lastParagraphWidth="w-1/2" />
                        <ParagraphSkeleton />
                    </article>}>
                <SuspendedDocumentContent
                    projectId={params.projectId}
                    documentId={params.documentId} />
            </Suspense>
        </>
    );
}

async function SuspendedBreadcrumbs(props: {
    projectId: string,
    documentId: string,
}) {
    const project = await getProjectCached(props.projectId);
    const document = await getDocumentCached(props.documentId);

    return (
        <Breadcrumbs
            locations={[
                { href: "/", title: "Home" },
                { href: "/projects", title: "Projects" },
                { href: `/projects/${props.projectId}`, title: project.title },
                { href: `/projects/${props.projectId}/documents/${props.documentId}`, title: document.title },
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
}) {
    const document = await getDocumentCached(props.documentId);

    return (
        <MoreButton
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