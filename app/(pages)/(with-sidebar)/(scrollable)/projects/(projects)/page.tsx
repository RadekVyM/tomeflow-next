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
import ScrollablePageLayout from "@/app/components/layout/ScrollablePageLayout";
import { getSessionCached } from "@/app/utils/session";
import EmptyProjects from "../../components/EmptyProjects";

export default async function Page() {
    return (
        <ScrollablePageLayout
            breadcrumbs={
                <Breadcrumbs
                    locations={[
                        { href: "/", title: "Home" },
                    ]} />}
            pageHeading={
                <PageHeading>
                    Projects
                </PageHeading>}
            actionButtons={
                <ActionButtons id="lg" />}
            smActionButtons={
                <ActionButtons id="sm" />}>

            <Suspense
                fallback={<CardListSkeleton withIcon itemsCount={5} />}>
                <ProjectsList />
            </Suspense>
        </ScrollablePageLayout>
    );
}

function ActionButtons(props: {
    id: string,
}) {
    const id = `${props.id}-projects-more`;

    return (
        <>
            <NewProjectButton
                size="sm" />
            <MoreButton
                id={id} />
        </>
    );
}

function MoreButton(props: {
    disabled?: boolean,
    id: string,
}) {
    return (
        <MoreDropdownButton
            id={props.id}
            size="sm"
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