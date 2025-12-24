"use client";

import { createDocumentAction } from "@/app/actions/documents";
import Button from "@/app/components/input/Button";
import TextInputDialog from "@/app/components/TextInputDialog";
import useDialog from "@/app/hooks/useDialog";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { useAction } from "next-safe-action/hooks";
import { LuFilePlus } from "react-icons/lu";

export default function NewDocumentButton(props: {
    className?: string,
    disabled?: boolean,
    projectId: string,
}) {
    const isLarge = useMediaQuery("(width >= 40rem)");
    const dialogState = useDialog();
    const action = useAction(createDocumentAction, {
        onSuccess: async () => await dialogState.hide(),
    });

    return (
        <>
            <Button
                variant={"dynamic-primary"}
                title={isLarge ? undefined : "New document"}
                className={props.className}
                onClick={dialogState.show}
                disabled={props.disabled}>
                <LuFilePlus /> <span>New document</span>
            </Button>

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