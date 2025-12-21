import Breadcrumbs from "@/app/components/Breadcrumbs";
import Header from "@/app/components/layout/Header";
import PageHeading from "@/app/components/layout/PageHeading";
import { getBoard } from "@/app/services/boards";
import { getProject } from "@/app/services/projects";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MoreButton from "./components/MoreButton";
import IntegratedBoard from "./components/IntegratedBoard";

export default async function BoardPage(props: {
    params: Promise<{ projectId: string, boardId: string }>
}) {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/");
    }

    const project = await getProject(session.user.id, params.projectId);
    const board = await getBoard(session.user.id, params.boardId);

    const isPending = !project || !board;

    return (
        <div
            className="flex flex-col h-dvh max-h-dvh overflow-hidden">
            <Header
                className="mb-3">
                <div
                    className="grid grid-cols-[calc(100%-var(--spacing)*9)_auto] items-start mt-1.5">
                    <div
                        className="flex-1">
                        <Breadcrumbs
                            locations={[
                                { href: "/", title: "Home" },
                                { href: "/projects", title: "Projects" },
                                { href: `/projects/${params.projectId}`, title: project?.title || "Loading..." },
                                { href: `/projects/${params.projectId}/boards/${params.boardId}`, title: board?.title || "Loading..." },
                            ]} />
                        <PageHeading>
                            {board?.title || "Loading..."}
                        </PageHeading>
                    </div>

                    <MoreButton
                        boardId={params.boardId}
                        boardTitle={board?.title || ""}
                        disabled={isPending} />
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