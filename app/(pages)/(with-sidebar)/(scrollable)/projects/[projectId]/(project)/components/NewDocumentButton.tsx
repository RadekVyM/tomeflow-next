"use client";

import { createDocumentAction } from "@/app/actions/documents";
import Button from "@/app/components/input/Button";
import DefaultButton from "@/app/components/input/DefaultButton";
import TextInputDialog from "@/app/components/TextInputDialog";
import toast from "@/app/components/toast";
import useDialog from "@/app/hooks/useDialog";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { useAction } from "next-safe-action/hooks";
import { TbPlus } from "react-icons/tb";

export default function NewDocumentButton(props: {
    className?: string,
    disabled?: boolean,
    nondynamic?: boolean,
    projectId: string,
}) {
    const isLarge = useMediaQuery("(width >= 40rem)");
    const dialogState = useDialog();
    const action = useAction(createDocumentAction, {
        onSuccess: async () => await dialogState.hide(),
        onError: () => toast("Failed to create a new document"),
    });

    return (
        <>
            <DefaultButton
                variant={props.nondynamic ? "primary" : "dynamic-primary"}
                title={isLarge ? undefined : "New document"}
                className={props.className}
                onClick={dialogState.show}
                disabled={props.disabled}
                icon={TbPlus}>
                New document
            </DefaultButton>

            <TextInputDialog
                state={dialogState}
                heading="New document"
                placeholder="Title"
                acceptTitle="Create document"
                onAcceptClick={(title) => action.execute({ title, projectId: props.projectId })}
                disabled={action.isPending} />
        </>
    );
}