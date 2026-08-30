"use client";

import { Dialog } from "../Dialog";
import Button from "../input/Button";
import { TbMinus, TbPlus, TbX } from "react-icons/tb";
import UniversalImage from "./UniversalImage";
import { DialogState } from "@/app/types/DialogState";
import PanZoomContainer, { PanZoomContext, PanZoomContextProvider } from "../PanZoomContainer";
import { useContext } from "react";

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
            className="relative isolate bg-transparent border-0 w-full h-full grid place-content-stretch max-h-screen max-w-screen">
            <PanZoomContextProvider>
                <PanZoomContainer
                    className="max-h-screen h-full max-w-screen">
                    <UniversalImage
                        className="pointer-events-none max-w-full object-contain"
                        src={props.src}
                        alt={props.alt}
                        title={props.title} />
                </PanZoomContainer>
                <ZoomBar />
            </PanZoomContextProvider>

            <Button
                className="absolute top-0 right-0 m-6"
                variant="icon-container"
                title="Close"
                onClick={props.state.hide}>
                <TbX />
            </Button>
        </Dialog>
    );
}

function ZoomBar() {
    const { actions, scale } = useContext(PanZoomContext);

    return (
        <div
            className="absolute right-6 bottom-4 flex items-stretch gap-1.5">
            <Button
                title="Zoom out"
                variant="icon-container"
                onClick={() => actions.current?.zoomOut()}>
                <TbMinus />
            </Button>

            <div
                className="bg-surface-container rounded-xl text-sm flex items-center justify-center min-w-15 px-2">
                {Math.round(100 * scale)}%
            </div>

            <Button
                title="Zoom in"
                variant="icon-container"
                onClick={() => actions.current?.zoomIn()}>
                <TbPlus />
            </Button>
        </div>
    );
}