"use client";

import type { DialogState } from "@/app/types/DialogState";
import BaseImagesDialog from "./BaseImagesDialog";
import BaseImagesDialogContent from "./BaseImagesDialogContent";
import ImagePreviewDialog from "./ImagePreviewDialog";
import useDialog from "@/app/hooks/useDialog";
import { useState } from "react";
import { DataImage } from "@/app/types/DataImage";

export default function ImagesDialog(props: {
    state: DialogState,
    projectId: string,
}) {
    return (
        <BaseImagesDialog
            state={props.state}>
            <Content
                {...props} />
        </BaseImagesDialog>
    );
}

function Content(props: {
    state: DialogState,
    projectId: string,
}) {
    const [selectedImage, setSelectedImage] = useState<DataImage | null>(null);
    const dialogState = useDialog();

    return (
        <>
            <BaseImagesDialogContent
                state={props.state}
                projectId={props.projectId}
                onImageClick={async (image) => {
                    setSelectedImage(image);
                    await dialogState.show();
                }} />

            <ImagePreviewDialog
                state={dialogState}
                src={selectedImage?.dataUrl}
                alt={selectedImage?.title} />
        </>
    );
}