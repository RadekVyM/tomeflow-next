"use client";

import { deleteBoardAction, renameBoardAction } from "@/app/actions/boards";
import { confirm } from "@/app/components/confirm";
import { MoreDropdownButton, MoreDropdownListButton } from "@/app/components/MoreDropdownButton";
import TextInputDialog from "@/app/components/TextInputDialog";
import toast from "@/app/components/toast";
import useDialog from "@/app/hooks/useDialog";
import { useAction } from "next-safe-action/hooks";
import { LuTextCursorInput, LuTrash } from "react-icons/lu";

export default function MoreButton(props: {
    id: string,
    boardId: string,
    boardTitle: string,
    disabled?: boolean,
}) {
    return (
        <MoreDropdownButton
            id={props.id}
            size="sm"
            disabled={props.disabled}>
            <RenameButton
                boardId={props.boardId}
                boardTitle={props.boardTitle} />
            <DeleteButton
                boardId={props.boardId} />
        </MoreDropdownButton>
    );
}

function RenameButton(props: {
    boardId: string,
    boardTitle: string,
}) {
    const dialogState = useDialog();
    const action = useAction(renameBoardAction, {
        onSuccess: async () => await dialogState.hide(),
        onError: () => toast("Failed to rename the board"),
    });

    return (
        <>
            <MoreDropdownListButton
                onClick={dialogState.show}
                icon={LuTextCursorInput}
                title="Rename board" />

            <TextInputDialog
                state={dialogState}
                heading="Rename board"
                placeholder="Title"
                acceptTitle="Rename"
                initialValue={props.boardTitle}
                onAcceptClick={(title) => action.execute({ id: props.boardId, title })}
                disabled={action.isPending} />
        </>
    );
}

function DeleteButton(props: {
    boardId: string,
}) {
    const action = useAction(deleteBoardAction, {
        onError: () => toast("Failed to delete the board"),
    });

    async function onDeleteClick() {
        if (!await confirm("Delete board", undefined, undefined, true)) {
            return;
        }

        action.execute({ id: props.boardId });
    }

    return (
        <MoreDropdownListButton
            className="text-danger"
            onClick={onDeleteClick}
            icon={LuTrash}
            title="Delete board" />
    );
}