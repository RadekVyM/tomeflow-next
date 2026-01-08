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
import { Suspense } from "react";
import { LuFile, LuLayoutDashboard, LuLayoutGrid, LuPackage } from "react-icons/lu";
import RecentContentSkeleton from "../components/RecentContent";
import RecentProjectsHeaderSkeleton from "../components/RecentProjectsHeaderSkeleton";
import EmptyProjects from "../components/EmptyProjects";
import { cn } from "@/app/utils/tailwind";
import ContentItemListHeading from "@/app/components/layout/ContentItemListHeading";
import ScrollablePageLayout from "@/app/components/layout/ScrollablePageLayout";

export default async function Page() {
    return (
        <ScrollablePageLayout>
            <Time
                className="mb-8" />

            <div
                className="flex-1 flex flex-col gap-8">
                <Suspense
                    fallback={
                        <section>
                            <RecentProjectsHeaderSkeleton />
                            <CardListSkeleton withIcon itemsCount={3} />
                        </section>}>
                    <ProjectsList />
                </Suspense>

                <Suspense
                    fallback={<RecentContentSkeleton headingClassName="max-w-48" itemsCount={5} />}>
                    <RecentContent />
                </Suspense>
            </div>
        </ScrollablePageLayout>
    );
}

async function RecentContent() {
    const session = await getSessionCached();
    const documents = await getRecentDocuments(session.user.id);
    const boards = await getRecentBoards(session.user.id);

    if (documents.length === 0 && boards.length === 0) {
        return undefined;
    }

    return (
        <section>
            <h2
                className="font-semibold text-2xl mb-4">
                Recent content
            </h2>
            {boards.length > 0 &&
                <>
                    <ContentItemListHeading>
                        Boards
                    </ContentItemListHeading>
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
                </>}
            {documents.length > 0 &&
                <>
                    <ContentItemListHeading
                        className={cn(boards.length > 0 && "mt-4")}>
                        Documents
                    </ContentItemListHeading>
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
                </>}
        </section>
    );
}

function RecentProjectsHeader() {
    return (
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
                    variant="dynamic-container"
                    size="sm">
                    <LuLayoutGrid /> <span>All projects</span>
                </Button>
            </div>
        </div>
    );
}

async function ProjectsList(props: {
    className?: string,
}) {
    const session = await getSessionCached();
    const projects = await getRecentProjects(session.user.id);

    if (projects.length === 0) {
        return (
            <EmptyProjects />
        );
    }

    return (
        <section>
            <RecentProjectsHeader />
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
        </section>
    );
}