"use client";

import type { DialogState } from "@/app/types/DialogState";
import { DataImage } from "@/app/types/DataImage";
import BaseImagesDialog from "./BaseImagesDialog";
import BaseImagesDialogContent from "./BaseImagesDialogContent";
import { useEffect, useState } from "react";

export default function UploadImagesDialog(props: {
    state: DialogState,
    projectId: string,
    onImageSelected?: (image: DataImage) => void,
}) {
    return (
        <>
            <BaseImagesDialog
                state={props.state}>
                <Content
                    {...props} />
            </BaseImagesDialog>
        </>
    );
}

function Content(props: {
    state: DialogState,
    projectId: string,
    onImageSelected?: (image: DataImage) => void,
}) {
    const [selectedImage, setSelectedImage] = useState<DataImage | null>(null);

    useEffect(() => resetSelectedImage(), [props.state.isOpen]);

    function resetSelectedImage() {
        if (props.state.isOpen) {
            setSelectedImage(null);
        }
    }

    return (
        <BaseImagesDialogContent
            state={props.state}
            projectId={props.projectId}
            selectedImage={selectedImage}
            onImagesChange={resetSelectedImage}
            onImageClick={(image) => setSelectedImage(image)}
            primaryButtonTitle="Select"
            onPrimaryButtonClick={async () => {
                if (selectedImage) {
                    props.onImageSelected?.(selectedImage);
                    await props.state.hide();
                }
            }}
            primaryButtonDisabled={!selectedImage} />
    );
}