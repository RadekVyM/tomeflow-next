"use client";

// TODO: Delete unused images

import { DataImage } from "../../types/DataImage";

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

export async function cacheDataImage(image: DataImage) {
    const images = await getImagesDirectory();

    try {
        const imageFileHandle = await images.getFileHandle(image.id, { create: true });
        const writableStream = await imageFileHandle.createWritable();
        await writableStream.write(JSON.stringify(image));
        await writableStream.close();
    }
    catch (e) {
        console.error(e);
    }
}

export async function getImagesDirectory() {
    const root = await navigator.storage.getDirectory();
    const projects = await root.getDirectoryHandle("projects", { create: true });
    return await projects.getDirectoryHandle("images", { create: true });
}