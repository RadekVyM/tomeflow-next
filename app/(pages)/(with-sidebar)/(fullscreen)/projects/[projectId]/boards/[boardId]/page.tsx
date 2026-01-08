import Breadcrumbs from "@/app/components/Breadcrumbs";
import Header from "@/app/components/layout/Header";
import PageHeading from "@/app/components/layout/PageHeading";
import { getBoard } from "@/app/services/boards";
import { getProject } from "@/app/services/projects";
import MoreButton from "./components/MoreButton";
import IntegratedBoard from "./components/IntegratedBoard";
import { getSessionCached } from "@/app/utils/session";
import { cache, Suspense } from "react";
import BreadcrumbsSkeleton from "@/app/components/skeleton/BreadcrumbsSkeleton";
import PageHeadingSkeleton from "@/app/components/skeleton/PageHeadingSkeleton";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import { notFound } from "next/navigation";
import { BoardPageContextProvider } from "./components/BoardPageContext";
import SyncingIndicator from "./components/SyncingIndicator";
import FullscreenPageLayout from "@/app/components/layout/FullscreenPageLayout";

const getProjectCached = cache(async (projectId: string) => {
    const session = await getSessionCached();
    const project = await getProject(session.user.id, projectId);

    if (!project) {
        notFound();
    }

    return project;
});

const getBoardCached = cache(async (boardId: string) => {
    const session = await getSessionCached();
    const board = await getBoard(session.user.id, boardId);

    if (!board) {
        notFound();
    }

    return board;
});

                // className="flex flex-col h-dvh max-h-dvh overflow-hidden"
export default async function BoardPage(props: {
    params: Promise<{ projectId: string, boardId: string }>
}) {
    const params = await props.params;

    return (
        <BoardPageContextProvider>
            <FullscreenPageLayout
                breadcrumbs={
                    <Suspense
                        fallback={<BreadcrumbsSkeleton loadedItemsCount={1} />}>
                        <SuspendedBreadcrumbs
                            projectId={params.projectId} />
                    </Suspense>}
                pageHeading={
                    <Suspense
                        fallback={<PageHeadingSkeleton className="max-w-60 mt-1 text-3xl" />}>
                        <SuspendedPageHeading
                            boardId={params.boardId} />
                    </Suspense>}
                actionButtons={
                    <ActionButtons
                        id="lg"
                        boardId={params.boardId} />}
                smActionButtons={
                    <ActionButtons
                        id="sm"
                        boardId={params.boardId} />}>

                <section
                    className="flex-1 overflow-x-auto overflow-y-hidden">
                    <IntegratedBoard
                        boardId={params.boardId}
                        projectId={params.projectId} />
                </section>
            </FullscreenPageLayout>
        </BoardPageContextProvider>
    );
}

function ActionButtons(props: {
    boardId: string,
    id: string,
}) {
    const id = `${props.id}-board-more`;

    return (
        <>
            <SyncingIndicator />

            <Suspense
                fallback={
                    <MoreDropdownButton
                        id={id}
                        size="sm"
                        disabled />}>
                <SuspendedActionButtons
                    boardId={props.boardId}
                    id={id} />
            </Suspense>
        </>
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
    boardId: string,
}) {
    const board = await getBoardCached(props.boardId);

    return (
        <PageHeading
            className="text-3xl line-clamp-1">
            {board.title}
        </PageHeading>
    );
}

async function SuspendedActionButtons(props: {
    boardId: string,
    id: string,
}) {
    const board = await getBoardCached(props.boardId);

    return (
        <MoreButton
            id={props.id}
            boardId={props.boardId}
            boardTitle={board.title} />
    );
}