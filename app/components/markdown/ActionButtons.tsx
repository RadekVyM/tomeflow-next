"use client";

import { TbEye, TbLibraryPhoto, TbPhotoCode, TbLink, TbPencil, TbDeviceFloppy } from "react-icons/tb";
import SelectImageDialog from "../images/SelectImageDialog";
import Button from "../input/Button";
import { DataImage } from "@/app/types/DataImage";
import useDialog from "@/app/hooks/useDialog";
import useInsertFormatting from "./useInsertFormatting";
import { RefObject } from "react";
import DefaultButton from "../input/DefaultButton";

export default function ActionButtons(props: {
    textAreaRef: RefObject<HTMLTextAreaElement | null>,
    text: string,
    projectId: string,
    editable: boolean,
    isPreview: boolean,
    setIsPreview: React.Dispatch<React.SetStateAction<boolean>>,
    setEditable: React.Dispatch<React.SetStateAction<boolean>>,
    setTextChanged: React.Dispatch<React.SetStateAction<boolean>>,
    setText: React.Dispatch<React.SetStateAction<string>>,
    onSaveClick: () => void,
    onImageSelected: (image: DataImage) => void,
}) {
    const {
        insertLink,
        insertImage,
    } = useInsertFormatting(props.textAreaRef, props.text, props.setTextChanged, props.setText);

    if (!props.editable) {
        return (
            <DefaultButton
                key="toggle"
                onClick={() => props.setEditable(true)}
                variant="container"
                icon={TbPencil}>
                Edit
            </DefaultButton>
        );
    }

    return (
        <>
            <Button
                variant="icon-container"
                title="Insert link"
                onMouseDown={(e) => e.preventDefault()}
                onClick={insertLink}>
                <TbLink />
            </Button>
            <Button
                variant="icon-container"
                title="Insert image"
                onMouseDown={(e) => e.preventDefault()}
                onClick={insertImage}>
                <TbPhotoCode />
            </Button>
            <ImagesButton
                projectId={props.projectId}
                disabled={props.isPreview}
                onImageSelected={props.onImageSelected} />
            <DefaultButton
                className="ml-1"
                onClick={() => props.setIsPreview((old) => !old)}
                variant={props.isPreview ? "dynamic-primary" : "dynamic-container"}
                icon={TbEye}>
                Preview
            </DefaultButton>
            <DefaultButton
                onClick={props.onSaveClick}
                variant="primary"
                icon={TbDeviceFloppy}>
                Save
            </DefaultButton>
        </>
    );
}

function ImagesButton(props: {
    projectId: string,
    disabled?: boolean,
    onImageSelected: (image: DataImage) => void,
}) {
    const dialogState = useDialog();

    return (
        <>
            <Button
                onClick={dialogState.show}
                variant="icon-container"
                title="Insert your image"
                disabled={props.disabled}>
                <TbLibraryPhoto />
            </Button>

            <SelectImageDialog
                projectId={props.projectId}
                state={dialogState}
                onImageSelected={props.onImageSelected} />
        </>
    );
}