"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { cacheDataImage, tryGetCachedDataImage } from "../services/client/images";
import { DataImage } from "../types/DataImage";

export default function LocalImage(props: {
    imageId: string,
    className?: string,
}) {
    const { isLoading, error, data: image } = useDataImage(props.imageId);

    if (isLoading) {
        return "Loading...";
    }

    if (error || !image) {
        return "Image could not be loaded.";
    }

    return (
        <img
            src={image.dataUrl}
            className={props.className} />
    );
}

function useDataImage(imageId: string) {
    return useQuery({
        queryKey: ["image", { imageId }],
        queryFn: async () => {
            const cachedImage = await tryGetCachedDataImage(imageId);

            if (cachedImage) {
                return cachedImage;
            }

            const image = await fetch(`/api/projects/images/${imageId}`)
                .then((res) => res.json())
                .then((data) => data as DataImage);

            await cacheDataImage(image);

            return image;
        },
    });
}