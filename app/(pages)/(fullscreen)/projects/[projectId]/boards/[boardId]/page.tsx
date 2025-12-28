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

export default async function BoardPage(props: {
    params: Promise<{ projectId: string, boardId: string }>
}) {
    const params = await props.params;

    return (
        <div
            className="flex flex-col h-dvh max-h-dvh overflow-hidden">
            <Header
                className="mb-3">
                <div
                    className="grid grid-cols-[calc(100%-var(--spacing)*9)_auto] items-start mt-1.5">
                    <div
                        className="flex-1">
                        <Suspense
                            fallback={<BreadcrumbsSkeleton loadedItemsCount={2} />}>
                            <SuspendedBreadcrumbs
                                projectId={params.projectId}
                                boardId={params.boardId} />
                        </Suspense>
                        <Suspense
                            fallback={<PageHeadingSkeleton className="max-w-60 mt-3" />}>
                            <SuspendedPageHeading
                                boardId={params.boardId} />
                        </Suspense>
                    </div>

                    <Suspense
                        fallback={
                            <MoreDropdownButton
                                id="board-more"
                                disabled />}>
                        <SuspendedActionButtons
                            boardId={params.boardId}/>
                    </Suspense>
                </div>
            </Header>

            <section
                className="flex-1 overflow-x-auto overflow-y-hidden">
                <IntegratedBoard
                    boardId={params.boardId}
                    projectId={params.projectId} />
            </section>
        </div>
    );
}


async function SuspendedBreadcrumbs(props: {
    projectId: string,
    boardId: string,
}) {
    const project = await getProjectCached(props.projectId);
    const board = await getBoardCached(props.boardId);

    return (
        <Breadcrumbs
            locations={[
                { href: "/", title: "Home" },
                { href: "/projects", title: "Projects" },
                { href: `/projects/${props.projectId}`, title: project.title },
                { href: `/projects/${props.projectId}/boards/${props.boardId}`, title: board.title },
            ]} />
    );
}

async function SuspendedPageHeading(props: {
    boardId: string,
}) {
    const board = await getBoardCached(props.boardId);

    return (
        <PageHeading>
            {board.title}
        </PageHeading>
    );
}

async function SuspendedActionButtons(props: {
    boardId: string,
}) {
    const board = await getBoardCached(props.boardId);

    return (
        <MoreButton
            boardId={props.boardId}
            boardTitle={board.title} />
    );
}