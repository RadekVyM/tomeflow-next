"use client";

import { VercelImage } from "@/app/types/VercelImage";
import { DataImage } from "../../types/DataImage";
import { fetchPost } from "./fetch";
// TODO: Delete unused images

export async function filterNonCachedIds(imageIds: Array<string>) {
    const images = await getImagesDirectory();
    const imageIdsSet = new Set(imageIds);

    for await (const fileName of images.keys()) {
        if (imageIdsSet.has(fileName)) {
            imageIdsSet.delete(fileName);
        }
    }

    return [...imageIdsSet];
}

export async function ensureCachedImages(imageIds: Array<string>, onFetchedImage?: (dataImage: DataImage) => void) {
    const imageIdsToFetch = await filterNonCachedIds(imageIds);

    if (imageIdsToFetch.length > 0) {
        const dtos = await fetchPost(`/api/projects/images`, { imageIds: imageIdsToFetch })
            .then((res) => res.json())
            .then((data) => (data || []) as Array<VercelImage>);

        for (const dto of dtos) {
            const dataImage = await cacheDataImage(dto);
            onFetchedImage?.(dataImage);
        }
    }
}

export async function getCachedImages(imageIds: Array<string>) {
    const images = await getImagesDirectory();
    const cachedImages = new Array<DataImage>();

    for (const id of imageIds) {
        try {
            const imageFileHandle = await images.getFileHandle(id, { create: false });
            const imageFile = await imageFileHandle.getFile();
            const data = await imageFile.text();
            const image = JSON.parse(data) as DataImage;

            cachedImages.push(image);
        }
        catch (e) {
            console.error(`Could not load this image from cache: ${id}`, e);
        }
    }

    return cachedImages;
}

export async function tryGetCachedDataImage(imageId: string) {
    const images = await getImagesDirectory();

    try {
        const imageFileHandle = await images.getFileHandle(imageId, { create: false });
        const imageFile = await imageFileHandle.getFile();
        const data = await imageFile.text();
        return JSON.parse(data) as DataImage;
    }
    catch {
        return null;
    }
}

export async function removeDataImageFromCache(imageId: string) {
    const images = await getImagesDirectory();

    try {
        await images.removeEntry(imageId);
    }
    catch {}
}

export async function cacheDataImage(image: VercelImage): Promise<DataImage> {
    const images = await getImagesDirectory();

    const file = await fetchImageBlob(image.vercelUrl);
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    const dataImage: DataImage = {
        id: image.id,
        projectId: image.projectId,
        title: image.title,
        dataUrl,
    };

    try {
        const imageFileHandle = await images.getFileHandle(image.id, { create: true });
        const writableStream = await imageFileHandle.createWritable();
        await writableStream.write(JSON.stringify(dataImage));
        await writableStream.close();
    }
    catch (e) {
        console.error(e);
    }
    finally {
        return dataImage;
    }
}

export async function getImagesDirectory() {
    const root = await navigator.storage.getDirectory();
    const projects = await root.getDirectoryHandle("projects", { create: true });
    return await projects.getDirectoryHandle("images", { create: true });
}

async function fetchImageBlob(vercelUrl: string) {
    const blob = await fetch(vercelUrl)
        .then((response) => response.blob());

    return blob;
}