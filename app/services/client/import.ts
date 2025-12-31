import { ExportedProject, ExportedProjectSchema } from "@/app/types/export/ExportedProject";
import { upload } from "@vercel/blob/client";
import JSZip from "jszip";
import z from "zod";
import { cacheDataImage } from "./images";
import { isNullOrWhiteSpace } from "@/app/utils/string";

const ExportedProjectsSchema = z.array(ExportedProjectSchema);

export async function importProjectsFromZip(file: File, uploadProjects: (projects: Array<ExportedProject>) => Promise<Array<{ new: string, old: string }> | undefined>) {
    const newZip = new JSZip();
    const zip = await newZip.loadAsync(file);

    const projects = await getProjects(zip);
    const imageIdsMapping = changeImageIds(projects);

    const projectsToUpload = projects.map((project) => {
        const newProject = { ...project };
        delete newProject.images;
        return newProject;
    });
    const projectIdsMapping = await uploadProjects(projectsToUpload);

    if (!projectIdsMapping) {
        return undefined;
    }

    const hasImages = projects.reduce((prev, current) => prev + (current.images?.length || 0), 0) > 0;

    return {
        projects,
        imageIdsMapping,
        projectIdsMapping: new Map(projectIdsMapping.map((value) => [value.old, value.new])),
        hasImages,
    };
}

export async function uploadImages(
    file: File,
    projects: Array<ExportedProject>,
    projectIdsMapping: Map<string, string>,
    imageIdsMapping: Map<string, string>,
) {
    const newZip = new JSZip();
    const zip = await newZip.loadAsync(file);

    for await (const image of getImages(zip)) {
        const id = imageIdsMapping.get(image.id);
        const project = projects.find((p) => p.images?.find((img) => img.id === image.id));
        const projectId = project ? projectIdsMapping.get(project.id) : undefined;
        const vercelImage = project ? project.images?.find((img) => img.id === image.id) : undefined;

        if (!id || !project || !projectId || !vercelImage) {
            continue;
        }

        const pathname = `${id}.${image.extension}`;

        const uploadedImage = await upload(pathname, image.blob, {
            access: "public",
            handleUploadUrl: "/api/projects/images/upload",
            clientPayload: JSON.stringify({
                id: id,
                projectId: projectId,
                title: vercelImage.title,
            }),
        });

        await cacheDataImage({
            id: id,
            projectId: projectId,
            title: vercelImage.title,
            vercelUrl: uploadedImage.url,
        }, image.blob);
    }
}

async function getProjects(zip: JSZip): Promise<Array<ExportedProject>> {
    const projectsJson = await zip.file("projects.json")?.async("string");

    if (!projectsJson) {
        throw new Error("Projects data are missing");
    }

    const parsedData = JSON.parse(projectsJson);

    if (!parsedData) {
        throw new Error("Data could not be parsed");
    }

    const result = await ExportedProjectsSchema.safeParseAsync(parsedData);

    if (result.error) {
        throw new Error(result.error.message);
    }

    return result.data;
}

async function* getImages(zip: JSZip) {
    const files = zip.folder("images")?.files;

    if (!files) {
        return;
    }

    for (const [_, file] of Object.entries(files)) {
        if (!file.name.startsWith("images/") || file.name == "images/") {
            continue;
        }

        const splitFilePath = file.name.split("/");
        const splitFileName = splitFilePath[splitFilePath.length - 1].split(".");

        if (splitFileName.length !== 2) {
            continue;
        }

        const blob = await file.async("blob");

        yield { id: splitFileName[0], extension: splitFileName[1], blob };
    }
}

function changeImageIds(projects: Array<ExportedProject>) {
    let imageIdsMapping = new Map<string, string>();

    for (const project of projects) {
        if (!project.images) {
            continue;
        }

        const projectImageIdsMapping = new Map<string, string>();

        for (const image of project.images) {
            const id = crypto.randomUUID();
            projectImageIdsMapping.set(image.id, id);
        }

        project.description = replaceImageIdsInString(project.description, projectImageIdsMapping);
        project.documents.forEach((doc) => doc.content = replaceImageIdsInString(doc.content, projectImageIdsMapping));
        project.boardItems.forEach((item) => item.description = replaceImageIdsInString(item.description, projectImageIdsMapping));

        imageIdsMapping = new Map([...imageIdsMapping, ...projectImageIdsMapping]);
    }

    return imageIdsMapping;
}

function replaceImageIdsInString<T extends string | null | undefined>(content: T, imageIdsMapping: Map<string, string>) {
    if (typeof content !== "string" || isNullOrWhiteSpace(content)) {
        return content;
    }

    let result = content as string;

    for (const [oldId, newId] of imageIdsMapping.entries()) {
        result = result.replaceAll(oldId, newId);
    }

    return result;
}