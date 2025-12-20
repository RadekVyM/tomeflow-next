import CardList from "@/app/components/card-list/CardList";
import CardListItem from "@/app/components/card-list/CardListItem";
import Button from "@/app/components/input/Button";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import NewProjectButton from "@/app/components/project/NewProjectButton";
import SignInButton from "@/app/components/SignInButton";
import Time from "@/app/components/Time";
import { getRecentBoards } from "@/app/services/boards";
import { getRecentDocuments } from "@/app/services/documents";
import { getRecentProjects } from "@/app/services/projects";
import { lastSeenAt } from "@/app/utils/entities";
import { cn } from "@/app/utils/tailwind";
import { auth } from "@/auth";
import { Suspense } from "react";
import { LuFile, LuLayoutDashboard, LuPackage } from "react-icons/lu";

export default async function Page() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div
                className="grid w-full h-[100dvh] place-content-center">
                <SignInButton />
            </div>
        );
    }

    return (
        <>
            <Time
                className="mb-8" />

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
                fallback={<LoadingSpinner />}>
                <ProjectsList
                    userId={session.user.id} />
            </Suspense>

            <Suspense
                fallback={<LoadingSpinner />}>
                <Boards
                    userId={session.user.id} />
            </Suspense>

            <Suspense
                fallback={<LoadingSpinner />}>
                <Documents
                    userId={session.user.id} />
            </Suspense>
        </>
    );
}

async function Boards(props: {
    userId: string,
}) {
    const boards = await getRecentBoards(props.userId);

    if (boards.length === 0) {
        return undefined;
    }

    return (
        <>
            <h2
                className="font-semibold text-2xl mb-4">
                Recent boards
            </h2>
            <CardList
                className="mb-8">
                {boards.map((board) =>
                    <CardListItem
                        key={board.id}
                        href={`/projects/${board.projectId}/boards/${board.id}`}
                        title={board.title}
                        subtitle={board.project.title}
                        lastSeenDate={new Date(lastSeenAt(board))}
                        icon={LuLayoutDashboard} />)}
            </CardList>
        </>
    );
}

async function Documents(props: {
    userId: string,
}) {
    const documents = await getRecentDocuments(props.userId);

    if (documents.length === 0) {
        return undefined;
    }

    return (
        <>
            <h2
                className="font-semibold text-2xl mb-4">
                Recent documents
            </h2>
            <CardList
                className="mb-8">
                {documents.map((document) =>
                    <CardListItem
                        key={document.id}
                        href={`/projects/${document.projectId}/documents/${document.id}`}
                        title={document.title}
                        subtitle={document.project.title}
                        lastSeenDate={new Date(lastSeenAt(document))}
                        icon={LuFile} />)}
            </CardList>
        </>
    );
}

async function ProjectsList(props: {
    className?: string,
    userId: string,
}) {
    const projects = await getRecentProjects(props.userId);

    if (projects.length === 0) {
        return <span className="mx-auto text-on-surface-muted text-sm my-3">No projects</span>
    }

    return (
        <CardList
            className={cn("mb-8", props.className)}>
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