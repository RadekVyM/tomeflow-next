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
import { LuCircleCheck, LuFilter } from "react-icons/lu";
import Button from "@/app/components/input/Button";
import { BoardPageContextProvider } from "./components/BoardPageContext";
import SyncingIndicator from "./components/SyncingIndicator";

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
        <BoardPageContextProvider>
            <div
                className="flex flex-col h-dvh max-h-dvh overflow-hidden">
                <Header
                    className="mb-1 items-end"
                    leading={
                        <Suspense
                            fallback={<BreadcrumbsSkeleton loadedItemsCount={1} />}>
                            <SuspendedBreadcrumbs
                                projectId={params.projectId} />
                        </Suspense>}>
                    <div
                        className="flex justify-between pr-1">
                        <Suspense
                            fallback={<PageHeadingSkeleton className="max-w-60 mt-1" />}>
                            <SuspendedPageHeading
                                boardId={params.boardId} />
                        </Suspense>

                        <div
                            className="flex items-center gap-2">
                            <SyncingIndicator />

                            <Suspense
                                fallback={
                                    <MoreDropdownButton
                                        id="board-more"
                                        size="sm"
                                        disabled />}>
                                <SuspendedActionButtons
                                    boardId={params.boardId}/>
                            </Suspense>
                        </div>
                    </div>
                </Header>

                <section
                    className="flex-1 overflow-x-auto overflow-y-hidden">
                    <IntegratedBoard
                        boardId={params.boardId}
                        projectId={params.projectId} />
                </section>
            </div>
        </BoardPageContextProvider>
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