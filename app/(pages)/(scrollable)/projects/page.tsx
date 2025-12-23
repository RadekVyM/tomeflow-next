import Breadcrumbs from "@/app/components/Breadcrumbs";
import PageHeading from "@/app/components/layout/PageHeading";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import NewProjectButton from "@/app/components/project/NewProjectButton";
import ExportButton from "./components/ExportButtont";
import ImportButton from "./components/ImportButton";
import { getAllProjects } from "@/app/services/projects";
import { auth } from "@/auth";
import CardListItem from "@/app/components/card-list/CardListItem";
import { lastSeenAt } from "@/app/utils/entities";
import { LuPackage } from "react-icons/lu";
import CardList from "@/app/components/card-list/CardList";
import { Suspense } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";

export default async function Page() {
    return (
        <>
            <header
                className="mb-8">
                <Breadcrumbs
                    locations={[
                        { href: "/", title: "Home" },
                        { href: "/projects", title: "Projects" },
                    ]} />
                <div
                    className="flex justify-between items-start">
                    <PageHeading>
                        Projects
                    </PageHeading>
                    <div
                        className="flex gap-2">
                        <NewProjectButton />
                        <MoreButton />
                    </div>
                </div>
            </header>

            <Suspense
                fallback={<CardListSkeleton withIcon itemsCount={5} />}>
                <ProjectsList />
            </Suspense>
        </>
    );
}

function MoreButton(props: {
    disabled?: boolean,
}) {
    return (
        <MoreDropdownButton
            id="projects-more"
            disabled={props.disabled}>
            <ExportButton />
            <ImportButton />
        </MoreDropdownButton>
    );
}

async function ProjectsList(props: {
    className?: string,
}) {
    const session = await auth();

    if (!session?.user?.id) {
        return "Not authorized";
    }

    const projects = await getAllProjects(session.user.id);

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