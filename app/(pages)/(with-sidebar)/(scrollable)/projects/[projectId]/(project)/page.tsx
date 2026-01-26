import Breadcrumbs from "@/app/components/Breadcrumbs";
import PageHeading from "@/app/components/layout/PageHeading";
import ProjectDescription from "@/app/(pages)/(with-sidebar)/(scrollable)/projects/[projectId]/(project)/components/ProjectDescription";
import { getProject } from "@/app/services/projects";
import MoreButton from "./components/MoreButton";
import NewDocumentButton from "./components/NewDocumentButton";
import { ProjectPageContextProvider } from "@/app/(pages)/(with-sidebar)/(scrollable)/projects/[projectId]/(project)/components/ProjectPageContext";
import { getAllProjectDocuments } from "@/app/services/documents";
import { getAllProjectBoards } from "@/app/services/boards";
import { cache, Suspense } from "react";
import { getSessionCached } from "@/app/utils/session";
import PageHeadingSkeleton from "@/app/components/skeleton/PageHeadingSkeleton";
import BreadcrumbsSkeleton from "@/app/components/skeleton/BreadcrumbsSkeleton";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import ParagraphSkeleton from "@/app/components/skeleton/ParagraphSkeleton";
import ScrollablePageLayout from "@/app/components/layout/ScrollablePageLayout";
import DocumentsBoardsSkeleton from "./components/DocumentsBoardsSkeleton";
import EmptyProject from "./components/EmptyProject";
import { notFound } from "next/navigation";
import DocumentBoardsList from "./components/DocumentBoardsList";
import ContentHeader from "./components/ContentHeader";

const getProjectCached = cache(async (projectId: string) => {
    const session = await getSessionCached();
    const project = await getProject(session.user.id, projectId);

    if (!project) {
        notFound();
    }

    return project;
});

export default async function Page(props: {
    params: Promise<{ projectId: string }>
}) {
    const params = await props.params;

    return (
        <ProjectPageContextProvider>
            <ScrollablePageLayout
                breadcrumbs={
                    <Suspense
                        fallback={<BreadcrumbsSkeleton loadedItemsCount={0} />}>
                        <SuspendedBreadcrumbs />
                    </Suspense>}
                pageHeading={
                    <Suspense
                        fallback={<PageHeadingSkeleton className="max-w-60" />}>
                        <SuspendedPageHeading
                            projectId={params.projectId} />
                    </Suspense>}
                actionButtons={
                    <ActionButtons
                        projectId={params.projectId}
                        id="lg" />}
                smActionButtons={
                    <ActionButtons
                        projectId={params.projectId}
                        id="sm" />}>

                <Suspense fallback={<ParagraphSkeleton />}>
                    <SuspendedProjectDescription
                        projectId={params.projectId} />
                </Suspense>
                <Suspense fallback={<DocumentsBoardsSkeleton />}>
                    <DocumentsBoards
                        projectId={params.projectId} />
                </Suspense>
            </ScrollablePageLayout>
        </ProjectPageContextProvider>
    );
}

function ActionButtons(props: {
    projectId: string,
    id: string,
}) {
    const id = `${props.id}-project-more`;

    return (
        <Suspense
            fallback={<>
                <NewDocumentButton
                    projectId={""}
                    disabled />
                <MoreDropdownButton
                    id={id}
                    disabled />
            </>}>
            <SuspendedActionButtons
                projectId={props.projectId}
                id={id} />
        </Suspense>
    );
}

async function SuspendedBreadcrumbs() {
    return (
        <Breadcrumbs
            locations={[
                { href: "/", title: "Home" },
                { href: "/projects", title: "Projects" },
            ]} />
    );
}

async function SuspendedPageHeading(props: {
    projectId: string,
}) {
    const project = await getProjectCached(props.projectId);

    return (
        <PageHeading>
            {project.title}
        </PageHeading>
    );
}

async function SuspendedActionButtons(props: {
    projectId: string,
    id: string,
}) {
    const project = await getProjectCached(props.projectId);

    return (
        <>
            <NewDocumentButton
                projectId={props.projectId} />
            <MoreButton
                id={props.id}
                projectId={props.projectId}
                projectTitle={project.title} />
        </>
    );
}

async function SuspendedProjectDescription(props: {
    projectId: string,
}) {
    const project = await getProjectCached(props.projectId);

    return (
        <ProjectDescription
            description={project.description}
            projectId={props.projectId} />
    );
}

async function DocumentsBoards(props: {
    projectId: string,
}) {
    const project = await getProjectCached(props.projectId);
    const session = await getSessionCached();
    const documents = await getAllProjectDocuments(session.user.id, props.projectId);
    const boards = await getAllProjectBoards(session.user.id, props.projectId);
    const hasHeading = !!project.description;

    if (documents.length === 0 && boards.length === 0 && !hasHeading) {
        return (
            <EmptyProject
                projectId={props.projectId} />
        );
    }

    return (
        <section>
            <ContentHeader
                hasHeading={hasHeading} />

            <DocumentBoardsList
                projectId={props.projectId}
                boards={boards}
                documents={documents} />
        </section>
    );
}