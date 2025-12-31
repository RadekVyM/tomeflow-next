"use client";

import { deleteProjectAction, renameProjectAction } from "@/app/actions/projects";
import { confirm } from "@/app/components/confirm";
import Button from "@/app/components/input/Button";
import { MoreDropdownButton, MoreDropdownListButton } from "@/app/components/MoreDropdownButton";
import TextInputDialog from "@/app/components/TextInputDialog";
import { ProjectPageContext } from "@/app/(pages)/(scrollable)/projects/[projectId]/(project)/components/ProjectPageContext";
import useDialog from "@/app/hooks/useDialog";
import { useAction } from "next-safe-action/hooks";
import { useContext } from "react";
import { LuCircleCheck, LuDownload, LuImage, LuLayoutDashboard, LuPencil, LuTextCursorInput, LuTrash } from "react-icons/lu";
import { createBoardAction } from "@/app/actions/boards";
import { downloadExportedData } from "@/app/services/client/export";
import ImagesDialog from "@/app/components/images/ImagesDialog";
import toast from "@/app/components/toast";
import LoadingIcon from "@/app/components/LoadingIcon";
import { useRouter } from "next/navigation";

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
        onError: () => toast("Failed to rename the project"),
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
        onError: () => toast("Failed to create a new board"),
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
        const closeToast = toast("Exporting project...", "permanent", LoadingIcon);

        try {
            await downloadExportedData(`/api/projects/${props.projectId}/export`, props.projectTitle.replace(" ", "_"));
            closeToast?.("Exported projects successfully", LuCircleCheck);
        }
        catch (e) {
            console.error(e);
            closeToast?.("Failed exporting projects");
        }
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
    const router = useRouter();
    const action = useAction(deleteProjectAction, {
        onError: () => toast("Failed to delete the project"),
    });

    async function onDeleteClick() {
        if (!await confirm("Delete project", undefined, undefined, true)) {
            return;
        }

        const result = await action.executeAsync({ id: props.projectId });

        // I need to do the redirect on the client to be able to show the following toast
        router.push("/projects");

        // For some reason, the onSuccess callback of useAction() is never called here
        if (!result.serverError && !result.validationErrors) {
            toast("Deleted the project successfully", "default", LuCircleCheck);
        }
    }

    return (
        <MoreDropdownListButton
            className="text-danger"
            onClick={onDeleteClick}
            icon={LuTrash}
            title="Delete project" />
    );
}