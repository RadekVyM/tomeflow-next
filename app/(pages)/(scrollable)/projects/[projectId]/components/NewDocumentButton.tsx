"use client";

import Button from "@/app/components/input/Button";
import TextInputDialog from "@/app/components/TextInputDialog";
import useDialog from "@/app/hooks/useDialog";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { isNullOrWhiteSpace } from "@/app/utils/string";
import { LuFilePlus } from "react-icons/lu";

export default function NewDocumentButton(props: {
    className?: string,
    disabled?: boolean,
    projectId: string,
}) {
    const isLarge = useMediaQuery("(width >= 40rem)");
    const dialogState = useDialog();
    //const { mutate: addDocument } = useAddDocument(props.projectId);

    async function onCreateClick(title: string) {
        if (isNullOrWhiteSpace(title)) {
            return;
        }

        //addDocument({ title });
        //await dialogState.hide();
    }

    return (
        <>
            <Button
                variant={isLarge ? "primary" : "icon-primary"}
                title={isLarge ? undefined : "New document"}
                className={props.className}
                onClick={dialogState.show}
                disabled={props.disabled}>
                <LuFilePlus /> {isLarge && "New document"}
            </Button>

            <TextInputDialog
                state={dialogState}
                heading="New document"
                placeholder="Title"
                acceptTitle="Create document"
                onAcceptClick={onCreateClick} />
        </>
    );
}