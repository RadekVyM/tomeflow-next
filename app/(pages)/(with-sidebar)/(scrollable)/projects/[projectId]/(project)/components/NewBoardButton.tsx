"use client";

import { createBoardAction } from "@/app/actions/boards";
import Button from "@/app/components/input/Button";
import TextInputDialog from "@/app/components/TextInputDialog";
import toast from "@/app/components/toast";
import useDialog from "@/app/hooks/useDialog";
import { useAction } from "next-safe-action/hooks";
import { TbLayoutDashboard } from "react-icons/tb";

export default function NewBoardButton(props: {
    projectId: string,
}) {
    const dialogState = useDialog();
    const action = useAction(createBoardAction, {
        onSuccess: async () => await dialogState.hide(),
        onError: () => toast("Failed to create a new board"),
    });

    return (
        <>
            <Button
                variant="container"
                onClick={dialogState.show}>
                <TbLayoutDashboard /> New board
            </Button>

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