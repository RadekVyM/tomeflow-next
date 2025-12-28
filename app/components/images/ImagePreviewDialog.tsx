"use client";

import { Dialog } from "../Dialog";
import Button from "../input/Button";
import { LuX } from "react-icons/lu";
import UniversalImage from "./UniversalImage";
import { DialogState } from "@/app/types/DialogState";

export default function ImagePreviewDialog(props: {
    state: DialogState,
    src?: string | Blob,
    alt?: string,
    title?: string,
}) {
    return (
        <Dialog
            ref={props.state.dialogRef}
            state={props.state}
            outerClassName="m-0 p-0"
            className="relative isolate bg-transparent border-0 w-full h-full grid place-content-center max-h-screen max-w-screen">
            <UniversalImage
                className="max-h-screen max-w-screen"
                src={props.src}
                alt={props.alt}
                title={props.title} />

            <Button
                className="absolute top-0 right-0 m-6"
                variant="icon-container"
                title="Close"
                onClick={props.state.hide}>
                <LuX />
            </Button>
        </Dialog>
    );
}