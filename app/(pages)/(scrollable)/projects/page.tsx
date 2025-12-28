import Breadcrumbs from "@/app/components/Breadcrumbs";
import PageHeading from "@/app/components/layout/PageHeading";
import { MoreDropdownButton } from "@/app/components/MoreDropdownButton";
import NewProjectButton from "@/app/components/project/NewProjectButton";
import ExportButton from "./components/ExportButton";
import ImportButton from "./components/ImportButton";
import { getAllProjects } from "@/app/services/projects";
import CardListItem from "@/app/components/card-list/CardListItem";
import { lastSeenAt } from "@/app/utils/entities";
import { LuPackage } from "react-icons/lu";
import CardList from "@/app/components/card-list/CardList";
import { Suspense } from "react";
import CardListSkeleton from "@/app/components/skeleton/CardListSkeleton";
import PageLayout from "@/app/components/layout/PageLayout";
import { getSessionCached } from "@/app/utils/session";
import EmptyProjects from "../components/EmptyProjects";

export default async function Page() {
    return (
        <PageLayout
            breadcrumbs={
                <Breadcrumbs
                    locations={[
                        { href: "/", title: "Home" },
                        { href: "/projects", title: "Projects" },
                    ]} />}
            pageHeading={
                <PageHeading>
                    Projects
                </PageHeading>}
            actionButtons={
                <>
                    <NewProjectButton />
                    <MoreButton />
                </>}>

            <Suspense
                fallback={<CardListSkeleton withIcon itemsCount={5} />}>
                <ProjectsList />
            </Suspense>
        </PageLayout>
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
    const session = await getSessionCached();
    const projects = await getAllProjects(session.user.id);

    if (projects.length === 0) {
        return (
            <EmptyProjects />
        );
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