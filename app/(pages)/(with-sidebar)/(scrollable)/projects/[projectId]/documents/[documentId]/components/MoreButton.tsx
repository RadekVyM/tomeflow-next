"use client";

import { deleteDocumentAction, renameDocumentAction } from "@/app/actions/documents";
import { confirm } from "@/app/components/confirm";
import { MoreDropdownButton, MoreDropdownListButton } from "@/app/components/MoreDropdownButton";
import TextInputDialog from "@/app/components/TextInputDialog";
import toast from "@/app/components/toast";
import useDialog from "@/app/hooks/useDialog";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { LuCircleCheck, LuTextCursorInput, LuTrash } from "react-icons/lu";

export default function MoreButton(props: {
    disabled?: boolean,
    documentId: string,
    documentTitle: string,
    id: string,
}) {
    return (
        <MoreDropdownButton
            id={props.id}
            size="sm"
            disabled={props.disabled}>
            <RenameButton
                documentId={props.documentId}
                documentTitle={props.documentTitle} />
            <DeleteButton
                documentId={props.documentId} />
        </MoreDropdownButton>
    );
}

function RenameButton(props: {
    documentId: string,
    documentTitle: string,
}) {
    const dialogState = useDialog();
    const action = useAction(renameDocumentAction, {
        onSuccess: async () => await dialogState.hide(),
        onError: () => toast("Failed to rename the document"),
    });

    return (
        <>
            <MoreDropdownListButton
                onClick={dialogState.show}
                icon={LuTextCursorInput}
                title="Rename document" />

            <TextInputDialog
                state={dialogState}
                heading="Rename document"
                placeholder="Title"
                acceptTitle="Rename"
                initialValue={props.documentTitle}
                onAcceptClick={(title) => action.execute({ id: props.documentId, title })}
                disabled={action.isPending} />
        </>
    );
}

function DeleteButton(props: {
    documentId: string,
}) {
    const router = useRouter();
    const action = useAction(deleteDocumentAction, {
        onError: () => toast("Failed to delete the document"),
    });

    async function onDeleteClick() {
        if (!await confirm("Delete document", undefined, undefined, true)) {
            return;
        }

        const result = await action.executeAsync({ id: props.documentId });

        // I need to do the redirect on the client to be able to show the following toast
        router.push(result.data?.redirectUrl ? result.data?.redirectUrl : "/projects");

        // For some reason, the onSuccess callback of useAction() is never called here
        if (!result.serverError && !result.validationErrors) {
            toast("Deleted the document successfully", "default", LuCircleCheck);
        }
    }

    return (
        <MoreDropdownListButton
            className="text-danger"
            onClick={onDeleteClick}
            icon={LuTrash}
            title="Delete document" />
    );
}