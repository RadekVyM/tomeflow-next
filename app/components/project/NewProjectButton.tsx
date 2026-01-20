"use client";

import useDialog from "../../hooks/useDialog";
import useMediaQuery from "../../hooks/useMediaQuery";
import TextInputDialog from "../TextInputDialog";
import { useAction } from "next-safe-action/hooks";
import { createProjectAction } from "@/app/actions/projects";
import toast from "../toast";
import { TbPlus } from "react-icons/tb";
import DefaultButton from "../input/DefaultButton";

export default function NewProjectButton(props: {
    className?: string,
    disabled?: boolean,
    nondynamic?: boolean,
}) {
    const isLarge = useMediaQuery("(width >= 40rem)");
    const dialogState = useDialog();
    const action = useAction(createProjectAction, {
        onSuccess: async () => await dialogState.hide(),
        onError: () => toast("Failed to create a new project"),
    });

    return (
        <>
            <DefaultButton
                variant={props.nondynamic ? "primary" : "dynamic-primary"}
                title={isLarge ? undefined : "New project"}
                className={props.className}
                onClick={dialogState.show}
                disabled={props.disabled}
                icon={TbPlus}>
                New project
            </DefaultButton>

            <TextInputDialog
                state={dialogState}
                heading="New project"
                placeholder="Title"
                acceptTitle="Create project"
                onAcceptClick={(title) => action.execute({ title })}
                disabled={props.disabled || action.isPending} />
        </>
    );
}