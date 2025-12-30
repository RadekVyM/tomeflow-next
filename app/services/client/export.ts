import { ExportedProject } from "@/app/types/export/ExportedProject";
import { ensureCachedImages, getCachedImages } from "./images";
import { DataImage } from "@/app/types/DataImage";
import JSZip from "jszip";

export async function downloadExportedData(apiUrl: string, fileName: string) {
    const blob = await fetchBlob(apiUrl);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.zip`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function fetchBlob(apiUrl: string) {
    const exportedDocument = await fetch(apiUrl)
        .then((response) => response.text());

    const projects = JSON.parse(exportedDocument) as Array<ExportedProject>;
    const imageIds = projects.flatMap((project) => project.images?.map((image) => image.id) || []);
    const images = await getImages(imageIds);

    const exportedProjects: Array<ExportedProject> = projects.map((project) => ({
        ...project,
        images: project.images?.map((image) => ({
            id: image.id,
            projectId: image.projectId,
            title: image.title,
        })),
    }));

    return await createBlob(exportedProjects, images);
}

async function createBlob(exportedProjects: Array<ExportedProject>, images: Array<DataImage>) {
    const zip = new JSZip();

    zip.file("projects.json", JSON.stringify(exportedProjects));

    for (const image of images) {
        const blob = await base64ToBlob(image.dataUrl);
        zip.file(`images/${image.id}.${blob.type.split("/")[1]}`, blob);
    }

    return await zip.generateAsync({ type: "blob" });
}

async function getImages(imageIds: Array<string>) {
    try {
        await ensureCachedImages(imageIds);
        return await getCachedImages(imageIds);
    }
    catch (e) {
        console.error(e);
        return [];
    }
}

async function base64ToBlob(dataUrl: string) {
    const response = await fetch(dataUrl);
    return await response.blob();
}