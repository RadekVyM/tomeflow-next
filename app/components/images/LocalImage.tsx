"use client";

import { useQuery } from "@tanstack/react-query";
import { cacheDataImage as cacheVercelImage, tryGetCachedDataImage } from "@/app/services/client/images";
import { VercelImage } from "@/app/types/VercelImage";
import Skeleton from "../skeleton/Skeleton";
import { cn } from "@/app/utils/tailwind";
import { useState } from "react";
import { TbPhotoOff } from "react-icons/tb";
import Button from "../input/Button";

export default function LocalImage(props: {
    imageId: string,
    className?: string,
    buttonClassName?: string,
    withStates?: boolean,
    onClick?: () => void,
    onReplaceClick?: () => void,
}) {
    const { isLoading, error, data: image } = useDataImage(props.imageId);
    const [loadFailed, setLoadFailed] = useState(false);
    const includeLoadingState = props.withStates && isLoading;

    if (includeLoadingState) {
        return (
            <Skeleton
                as="span"
                className={cn(props.className, "block h-64 mx-auto")} />
        );
    }

    if ((error || !image || loadFailed) && props.withStates) {
        return (
            <span
                className="rounded-xl border-2 border-outline-variant border-dashed h-64 flex flex-col items-center justify-center gap-3 p-4 text-sm text-on-surface-muted">
                <TbPhotoOff
                    className="h-10 w-10" />
                <span>Image could not be loaded</span>

                {props.onReplaceClick &&
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={props.onReplaceClick}>
                        Replace
                    </Button>}
            </span>
        );
    }

    if (props.onClick) {
        return (
            <button
                className={props.buttonClassName}
                onClick={props.onClick}>
                <img
                    src={image?.dataUrl}
                    alt={image?.title}
                    className={props.className}
                    onError={() => setLoadFailed(true)} />
            </button>
        );
    }

    return (
        <img
            src={image?.dataUrl}
            alt={image?.title}
            className={props.className}
            onError={() => setLoadFailed(true)} />
    );
}

function useDataImage(imageId: string) {
    return useQuery({
        queryKey: ["image", { imageId }],
        queryFn: async ({ signal }) => {
            const cachedImage = await tryGetCachedDataImage(imageId);

            if (cachedImage) {
                return cachedImage;
            }

            const image = await fetch(`/api/projects/images/${imageId}`, { signal })
                .then(async (res) => {
                    if (!res.ok) {
                        throw new Error(res.statusText);
                    }

                    return await res.json() as VercelImage;
                });

            return await cacheVercelImage(image);
        },
        retry: 1,
    });
}