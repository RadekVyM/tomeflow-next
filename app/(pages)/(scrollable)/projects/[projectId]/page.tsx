import Breadcrumbs from "@/app/components/Breadcrumbs";
import CardList from "@/app/components/card-list/CardList";
import PageHeading from "@/app/components/layout/PageHeading";
import ProjectDescription from "@/app/(pages)/(scrollable)/projects/[projectId]/components/ProjectDescription";
import { getProject } from "@/app/services/projects";
import { cn } from "@/app/utils/tailwind";
import MoreButton from "./components/MoreButton";
import NewDocumentButton from "./components/NewDocumentButton";
import { ProjectPageContextProvider } from "@/app/(pages)/(scrollable)/projects/[projectId]/components/ProjectPageContext";
import CardListItem from "@/app/components/card-list/CardListItem";
import { LuFile, LuLayoutDashboard } from "react-icons/lu";
import { getAllProjectDocuments } from "@/app/services/documents";
import { lastSeenAt } from "@/app/utils/entities";
import { getAllProjectBoards } from "@/app/services/boards";
import { cache, Suspense } from "react";
import { getSessionCached } from "@/app/utils/session";
import PageHeadingSkeleton from "@/app/components/skeleton/PageHeadingSkeleton";
import BreadcrumbsSkeleton from "@/app/components/skeleton/BreadcrumbsSkeleton";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import ParagraphSkeleton from "@/app/components/skeleton/ParagraphSkeleton";
import PageLayout from "@/app/components/layout/PageLayout";
import DocumentsBoardsSkeleton from "./components/DocumentsBoardsSkeleton";
import EmptyProject from "./components/EmptyProject";
import { notFound } from "next/navigation";

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
            <PageLayout
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
                    <Suspense
                        fallback={<>
                            <NewDocumentButton
                                projectId={""}
                                disabled />
                            <MoreDropdownButton
                                id="project-more"
                                size="sm"
                                disabled />
                        </>}>
                        <SuspendedActionButtons
                            projectId={params.projectId} />
                    </Suspense>}>

                <Suspense fallback={<ParagraphSkeleton />}>
                    <SuspendedProjectDescription
                        projectId={params.projectId} />
                </Suspense>
                <Suspense fallback={<DocumentsBoardsSkeleton />}>
                    <DocumentsBoards
                        projectId={params.projectId} />
                </Suspense>
            </PageLayout>
        </ProjectPageContextProvider>
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
}) {
    const project = await getProjectCached(props.projectId);

    return (
        <>
            <NewDocumentButton
                projectId={props.projectId} />
            <MoreButton
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
        <>
            {boards.length > 0 && 
                <ItemsSection
                    className={cn((hasHeading) && "mt-8")}
                    heading="Boards"
                    hasHeading={hasHeading || documents.length > 0}>
                    {boards.map((board) =>
                        <CardListItem
                            key={board.id}
                            href={`/projects/${props.projectId}/boards/${board.id}`}
                            title={board.title}
                            titleAs="h4"
                            lastSeenDate={new Date(lastSeenAt(board))}
                            icon={LuLayoutDashboard} />)}
                </ItemsSection>}

            {documents.length > 0 &&
                <ItemsSection
                    className={cn((hasHeading || boards.length > 0) && "mt-8")}
                    heading="Documents"
                    hasHeading={hasHeading || boards.length > 0}>
                    {documents.map((document) =>
                        <CardListItem
                            key={document.id}
                            href={`/projects/${props.projectId}/documents/${document.id}`}
                            title={document.title}
                            titleAs="h4"
                            lastSeenDate={new Date(lastSeenAt(document))}
                            icon={LuFile} />)}
                </ItemsSection>}
        </>
    );
}

function ItemsSection(props: {
    className?: string,
    heading: string,
    hasHeading: boolean,
    children?: React.ReactNode,
}) {
    return (
        <section
            className={props.className}>
            <h3
                className={cn("font-semibold text-2xl mb-4", !props.hasHeading && "sr-only")}>
                {props.heading}
            </h3>

            <CardList>
                {props.children}
            </CardList>
        </section>
    );
}