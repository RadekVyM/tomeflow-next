"use client";

import { deleteProjectAction, renameProjectAction } from "@/app/actions/projects";
import { confirm } from "@/app/components/confirm";
import Button from "@/app/components/input/Button";
import { MoreDropdownButton, MoreDropdownListButton } from "@/app/components/MoreDropdownButton";
import TextInputDialog from "@/app/components/TextInputDialog";
import { ProjectPageContext } from "@/app/(pages)/(scrollable)/projects/[projectId]/components/ProjectPageContext";
import useDialog from "@/app/hooks/useDialog";
import { useAction } from "next-safe-action/hooks";
import { useContext } from "react";
import { LuDownload, LuImage, LuLayoutDashboard, LuPencil, LuTextCursorInput, LuTrash } from "react-icons/lu";
import { createBoardAction } from "@/app/actions/boards";
import { downloadExportedData } from "@/app/services/client/export";
import ImagesDialog from "@/app/components/images/ImagesDialog";

export default function MoreButton(props: {
    projectId: string,
    projectTitle: string,
    disabled?: boolean,
}) {
    const { setDescriptionEditable } = useContext(ProjectPageContext);

    return (
        <MoreDropdownButton
            id="project-more"
            size="sm"
            disabled={props.disabled}>
            <NewBoardButton
                projectId={props.projectId} />
            <RenameButton
                projectId={props.projectId}
                projectTitle={props.projectTitle} />
            <Button
                className="w-full"
                size="sm"
                onClick={() => setDescriptionEditable(true)}>
                <LuPencil /> Edit description
            </Button>
            <ImagesButton
                projectId={props.projectId} />
            <ExportButton
                projectId={props.projectId}
                projectTitle={props.projectTitle} />
            <DeleteButton
                projectId={props.projectId} />
        </MoreDropdownButton>
    );
}

function RenameButton(props: {
    projectId: string,
    projectTitle: string,
}) {
    const dialogState = useDialog();
    const action = useAction(renameProjectAction, {
        onSuccess: async () => await dialogState.hide(),
    });

    return (
        <>
            <MoreDropdownListButton
                onClick={dialogState.show}
                icon={LuTextCursorInput}
                title="Rename project" />

            <TextInputDialog
                state={dialogState}
                heading="Rename project"
                placeholder="Title"
                acceptTitle="Rename"
                initialValue={props.projectTitle}
                onAcceptClick={(title) => action.execute({ id: props.projectId, title })}
                disabled={action.isPending} />
        </>
    );
}

function NewBoardButton(props: {
    projectId: string,
}) {
    const dialogState = useDialog();
    const action = useAction(createBoardAction, {
        onSuccess: async () => await dialogState.hide(),
    });

    return (
        <>
            <MoreDropdownListButton
                onClick={dialogState.show}
                icon={LuLayoutDashboard}
                title="New board" />

            <TextInputDialog
                state={dialogState}
                heading="New board"
                placeholder="Title"
                acceptTitle="Create board"
                onAcceptClick={(title) => action.execute({ title, projectId: props.projectId })}
                disabled={action.isPending} />
        </>
    );
}

function ExportButton(props: {
    projectId: string,
    projectTitle: string,
}) {
    async function onExportClick() {
        await downloadExportedData(`/api/projects/${props.projectId}/export`, props.projectTitle.replace(" ", "_"));
    }

    return (
        <MoreDropdownListButton
            onClick={onExportClick}
            icon={LuDownload}
            title="Export project" />
    );
}

function ImagesButton(props: {
    projectId: string,
}) {
    const dialogState = useDialog();

    return (
        <>
            <MoreDropdownListButton
                onClick={dialogState.show}
                icon={LuImage}
                title="Images" />

            <ImagesDialog
                state={dialogState}
                projectId={props.projectId} />
        </>
    );
}

function DeleteButton(props: {
    projectId: string,
}) {
    const action = useAction(deleteProjectAction);

    async function onDeleteClick() {
        if (!await confirm("Delete project", undefined, undefined, true)) {
            return;
        }

        action.execute({ id: props.projectId });
    }

    return (
        <MoreDropdownListButton
            className="text-danger"
            onClick={onDeleteClick}
            icon={LuTrash}
            title="Delete project" />
    );
}