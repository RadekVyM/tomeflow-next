"use client";

import { LuPackagePlus } from "react-icons/lu";
import useDialog from "../../hooks/useDialog";
import useMediaQuery from "../../hooks/useMediaQuery";
import TextInputDialog from "../TextInputDialog";
import { useAction } from "next-safe-action/hooks";
import { createProjectAction } from "@/app/actions/projects";
import Button from "../input/Button";

export default function NewProjectButton(props: {
    className?: string,
    disabled?: boolean,
    size?: "sm" | "default",
}) {
    const isLarge = useMediaQuery("(width >= 40rem)");
    const dialogState = useDialog();
    const action = useAction(createProjectAction, {
        onSuccess: async () => await dialogState.hide(),
    });

    return (
        <>
            <Button
                variant={"dynamic-primary"}
                size={props.size}
                title={isLarge ? undefined : "New project"}
                className={props.className}
                onClick={dialogState.show}
                disabled={props.disabled}>
                <LuPackagePlus /> <span>New project</span>
            </Button>

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