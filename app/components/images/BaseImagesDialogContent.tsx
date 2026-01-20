"use client";

import { TbTrash } from "react-icons/tb";
import Button from "../input/Button";
import LocalImage from "./LocalImage";
import { cn } from "@/app/utils/tailwind";
import { DataImage, SimpleDataImage } from "@/app/types/DataImage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDelete } from "@/app/services/client/fetch";
import { cacheDataImage, ensureCachedImages, getCachedImages, removeDataImageFromCache } from "@/app/services/client/images";
import { confirm } from "../confirm";
import Skeleton from "../skeleton/Skeleton";
import { FileSelection, LargeFileSelection } from "../input/FileSelection";
import ContentDialog from "../ContentDialog";
import React, { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import useDialog from "@/app/hooks/useDialog";
import { DialogState } from "@/app/types/DialogState";
import toast from "../toast";

export default function BaseImagesDialogContent(props: {
    state: DialogState,
    projectId: string,
    selectedImage?: DataImage | null,
    primaryButtonTitle?: React.ReactNode,
    primaryButtonDisabled?: boolean,
    onImageClick?: (image: DataImage) => void,
    onPrimaryButtonClick?: () => void,
    onImagesChange?: (images: Array<DataImage> | undefined) => void,
}) {
    const { isPending, error, data: images } = useImages(props.projectId);

    useEffect(() => {
        props.onImagesChange?.(images);
    }, [images]);

    return (
        <div
            className="flex flex-col gap-4 overflow-hidden max-h-full">
            <div
                className="flex-1 overflow-auto max-h-full px-5 py-2">
                {isPending && <ImagesSkeleton />}
                {(error || images && images.length === 0) &&
                    <div
                        className="grid place-content-center text-on-surface-container-muted py-16">
                        {error &&
                            "Images could not be loaded"}
                        {images && images.length === 0 &&
                            "No images found"}
                    </div>}
                {images && images.length > 0 &&
                    <ImagesContainer>
                        {images.map((image) =>
                            <Image
                                key={image.id}
                                image={image}
                                isSelected={image.id === props.selectedImage?.id}
                                onClick={() => props.onImageClick?.(image)} />)}
                    </ImagesContainer>}
            </div>

            <div
                className="flex justify-between px-5 pb-4">
                <UploadImageButton
                    projectId={props.projectId} />

                {props.primaryButtonTitle &&
                    <Button
                        variant="primary"
                        disabled={props.primaryButtonDisabled}
                        onClick={props.onPrimaryButtonClick}>
                        {props.primaryButtonTitle}
                    </Button>}
            </div>
        </div>
    );
}

function UploadImageButton(props: {
    projectId: string,
}) {
    const dialogState = useDialog();
    const queryClient = useQueryClient();
    const [selectedFile, setSelectedFile] = useState<File | null | undefined>(null);
    const [uploadPercentage, setUploadPercentage] = useState(0);
    const [uploadInProgress, setUploadInProgress] = useState(false);

    async function onUploadClick() {
        if (!selectedFile) {
            return;
        }

        setUploadInProgress(true);

        try {
            const id = crypto.randomUUID();
            const title = selectedFile.name;
            const splitTitle = selectedFile.name.split(".");
            const pathname = `${id}.${splitTitle[splitTitle.length - 1]}`;

            const uploadedImage = await upload(pathname, selectedFile, {
                access: "public",
                handleUploadUrl: "/api/projects/images/upload",
                clientPayload: JSON.stringify({
                    id: id,
                    projectId: props.projectId,
                    title: title,
                }),
                onUploadProgress: (e) => setUploadPercentage(e.percentage),
            });

            const dataImage = await cacheDataImage({
                id: id,
                projectId: props.projectId,
                title: title,
                vercelUrl: uploadedImage.url,
            });
            await queryClient.setQueryData(["images", { projectId: props.projectId, }], (old: Array<DataImage>) => [
                ...old,
                dataImage,
            ]);
        }
        catch (e) {
            console.error(e);
            toast("Failed to upload the image");
        }
        finally {
            await dialogState.hide();

            setUploadInProgress(false);
            setUploadPercentage(0);
            setSelectedFile(null);
        }
    }

    // TODO: Display the progress in the UI
    useEffect(() => console.log(uploadPercentage), [uploadPercentage]);

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
                            disabled={uploadInProgress} />

                        <Button
                            className="justify-self-end"
                            onClick={onUploadClick}
                            variant="primary"
                            disabled={uploadInProgress}>
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

function ImagesContainer(props: {
    className?: string,
    children?: React.ReactNode,
}) {
    return (
        <div
            className={cn("grid items-start grid-cols-[repeat(auto-fill,minmax(min(calc(var(--spacing)*48),100%),1fr))] gap-3", props.className)}>
            {props.children}
        </div>
    );
}

function Image(props: {
    image: DataImage,
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
                    "relative w-full mb-1 rounded-xl cursor-pointer hover:opacity-90 transition-opacity",
                    props.isSelected && "after:content-[''] after:absolute after:inset-0 after:border-3 after:border-primary after:rounded-xl")}
                onClick={props.onClick}
                disabled={isPending}>
                <LocalImage
                    className={cn("aspect-square w-full object-cover rounded-xl", props.isSelected && "border-[6px] border-surface-container rounded-xl")}
                    imageId={props.image.id} />
            </button>
            <Button
                className="absolute top-0 right-0 m-3"
                size="sm"
                variant="icon-container"
                title="Delete"
                onClick={onDeleteClick}
                disabled={isPending}>
                <TbTrash />
            </Button>
            <label
                className="text-xs text-on-surface-container-muted block overflow-hidden text-ellipsis max-w-full">
                {props.image.title}
            </label>
        </div>
    );
}

function ImagesSkeleton() {
    return (
        <ImagesContainer
            className="overflow-hidden">
            <div
                className="max-w-full w-full">
                <Skeleton
                    className="w-full h-full aspect-square mb-1 rounded-xl" />
                <Skeleton
                    className="text-xs block max-w-48" />
            </div>
            <div
                className="max-w-full w-full">
                <Skeleton
                    className="w-full h-full aspect-square mb-1 rounded-xl" />
                <Skeleton
                    className="text-xs block max-w-36" />
            </div>
        </ImagesContainer>
    );
}

function useImages(projectId: string) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ["images", { projectId }],
        queryFn: async ({ signal }) => {
            // await (await navigator.storage.getDirectory()).removeEntry("projects", { recursive: true });
            const simpleDtos = await fetch(`/api/projects/${projectId}/images`, { signal })
                .then(async (res) => {
                    if (!res.ok) {
                        throw new Error(res.statusText);
                    }

                    return (await res.json() || []) as Array<SimpleDataImage>;
                });

            const imageIds = simpleDtos.map((s) => s.id);
            await ensureCachedImages(imageIds, (dataImage) => {
                queryClient.setQueryData(["image", { imageId: dataImage.id }], dataImage);
            });
            return await getCachedImages(imageIds);
        },
    });
}

function useDeleteImage(projectId: string, imageId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            queryClient.setQueryData(["images", { projectId }], (old: Array<DataImage>) =>
                old.filter((image) => image.id !== imageId));

            await fetchDelete(`/api/projects/images/${imageId}`);
            await removeDataImageFromCache(imageId);
        },
        onError: () => toast("Failed to delete the image"),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["images", { projectId }] }),
    });
}