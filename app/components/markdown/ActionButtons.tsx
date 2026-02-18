"use client";

import { TbLibraryPhoto, TbPhotoCode, TbLink, TbIndentIncrease, TbIndentDecrease } from "react-icons/tb";
import SelectImageDialog from "../images/SelectImageDialog";
import Button from "../input/Button";
import { DataImage } from "@/app/types/DataImage";
import useDialog from "@/app/hooks/useDialog";
import useInsertFormatting from "./useInsertFormatting";
import { RefObject } from "react";

export default function ActionButtons(props: {
    textAreaRef: RefObject<HTMLTextAreaElement | null>,
    text: string,
    projectId: string,
    setTextChanged: React.Dispatch<React.SetStateAction<boolean>>,
    setText: React.Dispatch<React.SetStateAction<string>>,
    onImageSelected: (image: DataImage) => void,
}) {
    const {
        insertLink,
        insertImage,
        indent,
        outdent,
    } = useInsertFormatting(props.textAreaRef, props.text, props.setTextChanged, props.setText);

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
                onImageSelected={props.onImageSelected} />
            <Button
                variant="icon-container"
                title="Indent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={indent}>
                <TbIndentIncrease />
            </Button>
            <Button
                variant="icon-container"
                title="Outdent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={outdent}>
                <TbIndentDecrease />
            </Button>
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