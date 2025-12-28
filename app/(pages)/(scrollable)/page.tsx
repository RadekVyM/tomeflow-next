import CardList from "@/app/components/card-list/CardList";
import CardListItem from "@/app/components/card-list/CardListItem";
import Button from "@/app/components/input/Button";
import NewProjectButton from "@/app/components/project/NewProjectButton";
import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import Time from "@/app/components/Time";
import { getRecentBoards } from "@/app/services/boards";
import { getRecentDocuments } from "@/app/services/documents";
import { getRecentProjects } from "@/app/services/projects";
import { lastSeenAt } from "@/app/utils/entities";
import { getSessionCached } from "@/app/utils/session";
import { cn } from "@/app/utils/tailwind";
import { Suspense } from "react";
import { LuFile, LuLayoutDashboard, LuPackage } from "react-icons/lu";
import ItemsSectionSkeleton from "./components/ItemsSectionSkeleton";

export default async function Page() {
    return (
        <>
            <Time
                className="mb-8" />

            <div
                className="flex flex-col gap-8">
                <section>
                    <div
                        className="flex justify-between items-start mb-4">
                        <h2
                            className="font-semibold text-2xl">
                            Recent projects
                        </h2>

                        <div
                            className="flex gap-2">
                            <NewProjectButton
                                size="sm" />
                            <Button
                                href="/projects"
                                variant="container"
                                size="sm">
                                All projects
                            </Button>
                        </div>
                    </div>

                    <Suspense
                        fallback={<CardListSkeleton withIcon itemsCount={3} />}>
                        <ProjectsList />
                    </Suspense>
                </section>

                <Suspense
                    fallback={<ItemsSectionSkeleton headingClassName="max-w-48" itemsCount={2} />}>
                    <Boards />
                </Suspense>

                <Suspense
                    fallback={<ItemsSectionSkeleton headingClassName="max-w-56" itemsCount={5} />}>
                    <Documents />
                </Suspense>
            </div>
        </>
    );
}

async function Boards() {
    const session = await getSessionCached();
    const boards = await getRecentBoards(session.user.id);

    if (boards.length === 0) {
        return undefined;
    }

    return (
        <section>
            <h2
                className="font-semibold text-2xl mb-4">
                Recent boards
            </h2>
            <CardList>
                {boards.map((board) =>
                    <CardListItem
                        key={board.id}
                        href={`/projects/${board.projectId}/boards/${board.id}`}
                        title={board.title}
                        subtitle={board.project.title}
                        lastSeenDate={new Date(lastSeenAt(board))}
                        icon={LuLayoutDashboard} />)}
            </CardList>
        </section>
    );
}

async function Documents() {
    const session = await getSessionCached();
    const documents = await getRecentDocuments(session.user.id);

    if (documents.length === 0) {
        return undefined;
    }

    return (
        <section>
            <h2
                className="font-semibold text-2xl mb-4">
                Recent documents
            </h2>
            <CardList>
                {documents.map((document) =>
                    <CardListItem
                        key={document.id}
                        href={`/projects/${document.projectId}/documents/${document.id}`}
                        title={document.title}
                        subtitle={document.project.title}
                        lastSeenDate={new Date(lastSeenAt(document))}
                        icon={LuFile} />)}
            </CardList>
        </section>
    );
}

async function ProjectsList(props: {
    className?: string,
}) {
    const session = await getSessionCached();
    const projects = await getRecentProjects(session.user.id);

    if (projects.length === 0) {
        return <span className="mx-auto text-on-surface-muted text-sm my-3">No projects</span>
    }

    return (
        <CardList
            className={props.className}>
            {projects.map((project) =>
                <CardListItem
                    key={project.id}
                    href={`/projects/${project.id}`}
                    title={project.title}
                    lastSeenDate={new Date(lastSeenAt(project))}
                    icon={LuPackage} />)}
        </CardList>
    );
}