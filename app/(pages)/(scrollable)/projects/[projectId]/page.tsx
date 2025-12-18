import Breadcrumbs from "@/app/components/Breadcrumbs";
import CardList from "@/app/components/card-list/CardList";
import PageHeading from "@/app/components/layout/PageHeading";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ProjectDescription from "@/app/(pages)/(scrollable)/projects/[projectId]/components/ProjectDescription";
import { getProject } from "@/app/services/projects";
import { cn } from "@/app/utils/tailwind";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MoreButton from "./components/MoreButton";
import NewDocumentButton from "./components/NewDocumentButton";
import { ProjectPageContextProvider } from "@/app/contexts/ProjectPageContext";

export default async function Page(props: {
    params: Promise<{ projectId: string }>
}) {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/");
    }

    const project = await getProject(session.user.id, params.projectId);

    return (
        <ProjectPageContextProvider>
            <header
                className="mb-8">
                <Breadcrumbs
                    locations={[
                        { href: "/", title: "Home" },
                        { href: "/projects", title: "Projects" },
                        { href: `/projects/${params.projectId}`, title: project?.title || "Loading..." },
                    ]} />
                <div
                    className="flex justify-between items-start">
                    <PageHeading>
                        {project?.title}
                    </PageHeading>
                    <div
                        className="flex gap-2">
                        <NewDocumentButton
                            disabled={!project}
                            projectId={params.projectId} />
                        <MoreButton
                            disabled={!project}
                            projectId={params.projectId}
                            projectTitle={project?.title || ""} />
                    </div>
                </div>
            </header>

            {(!project) ?
                <LoadingSpinner /> :
                <>
                    <ProjectDescription
                        description={project.description}
                        projectId={params.projectId} />
                </>}
        </ProjectPageContextProvider>
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
                className={cn("font-semibold text-3xl mb-4", !props.hasHeading && "sr-only")}>
                {props.heading}
            </h3>

            <CardList>
                {props.children}
            </CardList>
        </section>
    );
}