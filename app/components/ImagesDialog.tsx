// @ts-nocheck

import type { DialogState } from "../types/DialogState";
import ContentDialog from "./ContentDialog";
import LocalImage from "./LocalImage";
import Button from "./Button";
import useDialog from "../hooks/useDialog";
import { useEffect, useState } from "react";
import { FileSelection, LargeFileSelection } from "./input/FileSelection";
import { LuTrash } from "react-icons/lu";
import { confirm } from "./confirm";
import { cn } from "../utils/tailwind";
import LoadingSpinner from "./LoadingSpinner";

export default function ImagesDialog(props: {
    state: DialogState,
    projectId: string,
    onImageSelected?: (image: DataImageDto) => void,
}) {
    const { isPending, error, data: images } = useImages(props.projectId);
    const [selectedImage, setSelectedImage] = useState<DataImageDto | null>(null);

    useEffect(() => {
        if (props.state.isOpen) {
            setSelectedImage(null);
        }
    }, [props.state.isOpen, images]);

    return (
        <>
            <ContentDialog
                ref={props.state.dialogRef}
                state={props.state}
                heading="Images"
                className="max-w-5xl max-h-full overflow-hidden px-0 pb-0"
                headerClassName="px-5">
                <div
                    className="flex flex-col gap-4 overflow-hidden max-h-full">
                    <div
                        className="flex-1 overflow-auto max-h-full px-5 py-2">
                        {isPending && <LoadingSpinner />}
                        {error && "Images could not be loaded"}
                        {images && images.length === 0 &&
                            "No images"}
                        {images && images.length > 0 &&
                            <div
                                className="grid items-start grid-cols-[repeat(auto-fill,_minmax(min(calc(var(--spacing)*48),_100%),_1fr))] gap-3">
                                {images.map((image) =>
                                    <Image
                                        key={image.id}
                                        image={image}
                                        isSelected={image.id === selectedImage?.id}
                                        onClick={() => setSelectedImage(image)} />)}
                            </div>}
                    </div>
                    
                    <div
                        className="flex justify-between px-5 pb-4">
                        <UploadImageButton
                            projectId={props.projectId} />
                        
                        <Button
                            variant="primary"
                            disabled={!selectedImage}
                            onClick={async () => {
                                if (selectedImage) {
                                    props.onImageSelected?.(selectedImage);
                                    await props.state.hide();
                                }
                            }}>
                            Select
                        </Button>
                    </div>
                </div>
            </ContentDialog>
        </>
    );
}

function Image(props: {
    image: DataImageDto,
    isSelected: boolean,
    onClick: () => void,
}) {
    const { isPending, mutate: deleteImage } = useDeleteImage(props.image.projectId, props.image.id);

    async function onDeleteClick() {
        if (!await confirm("Delete image", undefined, undefined, true)) {
            return;
        }

        deleteImage();
    }

    return (
        <div
            className="max-w-full w-full relative">
            <button
                className={cn(
                    "relative w-full mb-1 rounded-md cursor-pointer hover:opacity-90 transition-opacity",
                    props.isSelected && "after:content-[''] after:absolute after:inset-0 after:border-3 after:border-primary after:rounded-lg")}
                onClick={props.onClick}
                disabled={isPending}>
                <LocalImage
                    className={cn("aspect-square w-full object-cover rounded-md", props.isSelected && "border-[6px] border-surface-container rounded-xl")}
                    imageId={props.image.id} />
            </button>
            <Button
                className="absolute top-0 right-0 m-3"
                size="sm"
                variant="icon-container"
                title="Delete"
                onClick={onDeleteClick}
                disabled={isPending}>
                <LuTrash />
            </Button>
            <label
                className="text-xs text-on-surface-container-muted block overflow-hidden text-ellipsis max-w-full">
                {props.image.title}
            </label>
        </div>
    );
}

function UploadImageButton(props: {
    projectId: string,
}) {
    const dialogState = useDialog();
    const { isPending, mutateAsync: uploadImage } = useUploadImage(props.projectId);
    const [selectedFile, setSelectedFile] = useState<File | null | undefined>(null);

    async function onUploadClick() {
        if (!selectedFile) {
            return;
        }

        await uploadImage(selectedFile);
        await dialogState.hide();
        setSelectedFile(null);
    }

    return (
        <>
            <Button
                variant="container"
                onClick={dialogState.show}>
                Upload image
            </Button>

            <ContentDialog
                className="max-w-2xl"
                ref={dialogState.dialogRef}
                state={dialogState}
                heading="Upload image">
                {selectedFile ?
                    <div
                        className="grid grid-rows-[1fr_auto] gap-3">
                        <FileSelection
                            file={selectedFile}
                            onFileSelect={setSelectedFile}
                            accept="image/*"
                            disabled={isPending} />
                        
                        <Button
                            className="justify-self-end"
                            onClick={onUploadClick}
                            variant="primary"
                            disabled={isPending}>
                            Upload
                        </Button>
                    </div> :
                    <LargeFileSelection
                        className="w-full"
                        file={selectedFile}
                        onFileSelect={setSelectedFile}
                        accept="image/*" />}
            </ContentDialog>
        </>
    );
}