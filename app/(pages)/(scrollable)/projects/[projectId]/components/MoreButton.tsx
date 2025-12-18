"use client";

import { deleteProjectAction, renameProjectAction } from "@/app/actions/projects";
import { confirm } from "@/app/components/confirm";
import Button from "@/app/components/input/Button";
import { MoreDropdownButton, MoreDropdownListButton } from "@/app/components/MoreDropdownButton";
import TextInputDialog from "@/app/components/TextInputDialog";
import { ProjectPageContext } from "@/app/contexts/ProjectPageContext";
import useDialog from "@/app/hooks/useDialog";
import { isNullOrWhiteSpace } from "@/app/utils/string";
import { useAction } from "next-safe-action/hooks";
import { useContext } from "react";
import { LuDownload, LuLayoutDashboard, LuPencil, LuTextCursorInput, LuTrash } from "react-icons/lu";

export default function MoreButton(props: {
    projectId: string,
    projectTitle: string,
    disabled?: boolean,
}) {
    const { setDescriptionEditable } = useContext(ProjectPageContext);

    return (
        <MoreDropdownButton
            id="project-more"
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

    async function onRenameClick(title: string) {
        if (isNullOrWhiteSpace(title)) {
            return;
        }

        action.execute({ id: props.projectId, title });
    }

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
                onAcceptClick={onRenameClick} />
        </>
    );
}

function NewBoardButton(props: {
    projectId: string,
}) {
    const dialogState = useDialog();
    //const { mutate: addBoard } = useAddBoard(props.projectId);

    async function onCreateClick(title: string) {
        if (isNullOrWhiteSpace(title)) {
            return;
        }

        //addBoard({ title });
        //await dialogState.hide();
    }

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
                onAcceptClick={onCreateClick} />
        </>
    );
}

function ExportButton(props: {
    projectId: string,
    projectTitle: string,
}) {
    async function onExportClick() {
        // await downloadExportedData(`/api/export/projects/${props.projectId}`, props.projectTitle.replace(" ", "_"));
    }

    return (
        <MoreDropdownListButton
            onClick={onExportClick}
            icon={LuDownload}
            title="Export project" />
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