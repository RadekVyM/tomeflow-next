// @ts-nocheck

import { LuPackagePlus } from "react-icons/lu";
import useDialog from "../../hooks/useDialog";
import useMediaQuery from "../../hooks/useMediaQuery";
import { isNullOrWhiteSpace } from "../../utils/string";
import Button from "../Button";
import TextInputDialog from "../TextInputDialog";

export default function NewProjectButton(props: {
    className?: string,
    size?: "sm" | "default",
}) {
    const isLarge = useMediaQuery("(width >= 25rem)");
    const dialogState = useDialog();
    const { mutate: addProject } = useAddProject();

    async function onCreateClick(title: string) {
        if (isNullOrWhiteSpace(title)) {
            return;
        }

        addProject(title);
        await dialogState.hide();
    }

    return (
        <>
            <Button
                variant={isLarge ? "primary" : "icon-primary"}
                size={props.size}
                title={isLarge ? undefined : "New project"}
                className={props.className}
                onClick={dialogState.show}>
                <LuPackagePlus /> {isLarge && "New project"}
            </Button>

            <TextInputDialog
                state={dialogState}
                heading="New project"
                placeholder="Title"
                acceptTitle="Create project"
                onAcceptClick={onCreateClick} />
        </>
    );
}