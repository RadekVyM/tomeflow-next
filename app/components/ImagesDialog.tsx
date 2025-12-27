"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DialogState } from "../types/DialogState";
import ContentDialog from "./ContentDialog";
import LocalImage from "./LocalImage";
import useDialog from "../hooks/useDialog";
import { useEffect, useState } from "react";
import { LuTrash } from "react-icons/lu";
import { confirm } from "./confirm";
import { cn } from "../utils/tailwind";
import LoadingSpinner from "./LoadingSpinner";
import Button from "./input/Button";
import { FileSelection, LargeFileSelection } from "./input/FileSelection";
import { cacheDataImage, filterNonCachedIds, getCachedImages, removeDataImageFromCache } from "../services/client/images";
import { DataImage, SimpleDataImage } from "../types/DataImage";
import { fetchDelete, fetchPost } from "../services/client/fetch";
import useIsClient from "../hooks/useIsClient";
import { upload } from "@vercel/blob/client";
import { VercelImage } from "../types/VercelImage";
import Skeleton from "./skeleton/Skeleton";

export default function ImagesDialog(props: {
    state: DialogState,
    projectId: string,
    onImageSelected?: (image: DataImage) => void,
}) {
    const isClient = useIsClient();

    if (!isClient) {
        return undefined;
    }

    return (
        <>
            <ContentDialog
                ref={props.state.dialogRef}
                state={props.state}
                heading="Images"
                className="max-w-5xl max-h-full overflow-hidden px-0 pb-0"
                headerClassName="px-5">
                <DialogContent
                    {...props} />
            </ContentDialog>
        </>
    );
}

function DialogContent(props: {
    state: DialogState,
    projectId: string,
    onImageSelected?: (image: DataImage) => void,
}) {
    const { isPending, error, data: images } = useImages(props.projectId);
    const [selectedImage, setSelectedImage] = useState<DataImage | null>(null);

    useEffect(() => {
        if (props.state.isOpen) {
            setSelectedImage(null);
        }
    }, [props.state.isOpen, images]);

    return (
        <>
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
                                    isSelected={image.id === selectedImage?.id}
                                    onClick={() => setSelectedImage(image)} />)}
                        </ImagesContainer>}
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
        </>
    );
}

function ImagesContainer(props: {
    className?: string,
    children?: React.ReactNode,
}) {
    return (
        <div
            className={cn("grid items-start grid-cols-[repeat(auto-fill,_minmax(min(calc(var(--spacing)*48),_100%),_1fr))] gap-3", props.className)}>
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
        finally {
            await dialogState.hide();

            setUploadInProgress(false);
            setUploadPercentage(0);
            setSelectedFile(null);
        }
    }

    // TODO: Dispaly the progress in the UI
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

function ImagesSkeleton() {
    return (
        <ImagesContainer
            className="overflow-hidden">
            <Skeleton
                className="max-w-full w-full h-full aspect-square" />
            <Skeleton
                className="max-w-full w-full h-full aspect-square" />
        </ImagesContainer>
    );
}

function useImages(projectId: string) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ["images", { projectId }],
        queryFn: async () => {
            // await (await navigator.storage.getDirectory()).removeEntry("projects", { recursive: true });
            const simpleDtos = await fetch(`/api/projects/${projectId}/images`)
                .then((res) => res.json())
                .then((data) => (data || []) as Array<SimpleDataImage>);

            const imageIds = simpleDtos.map((s) => s.id);
            const imageIdsToFetch = await filterNonCachedIds(imageIds);

            if (imageIdsToFetch.length > 0) {
                const dtos = await fetchPost(`/api/projects/images`, { imageIds: imageIdsToFetch })
                    .then((res) => res.json())
                    .then((data) => (data || []) as Array<VercelImage>);

                for (const dto of dtos) {
                    const dataImage = await cacheDataImage(dto);
                    queryClient.setQueryData(["image", { imageId: dto.id }], dataImage);
                }
            }

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
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["images", { projectId }] }),
    });
}