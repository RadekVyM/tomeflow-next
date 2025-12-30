import { ExportedProject, ExportedProjectSchema } from "@/app/types/export/ExportedProject";
import { upload } from "@vercel/blob/client";
import JSZip from "jszip";
import z from "zod";
import { cacheDataImage } from "./images";
import { isNullOrWhiteSpace } from "@/app/utils/string";

const ExportedProjectsSchema = z.array(ExportedProjectSchema);

export async function importProjectsFromZip(file: File, uploadProjects: (projects: Array<ExportedProject>) => Promise<Array<{ new: string, old: string }> | undefined>): Promise<void> {
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

    if (projectIdsMapping === undefined) {
        console.log("did not get projectIdsMapping back");
        return;
    }

    await uploadImages(
        zip,
        projects,
        new Map(projectIdsMapping.map((value) => [value.old, value.new])),
        imageIdsMapping);
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

async function uploadImages(
    zip: JSZip,
    projects: Array<ExportedProject>,
    projectIdsMapping: Map<string, string>,
    imageIdsMapping: Map<string, string>,
) {
    console.log("uploading images");

    console.log(projectIdsMapping, projectIdsMapping.entries());
    console.log(imageIdsMapping, imageIdsMapping.entries());

    for await (const image of getImages(zip)) {
        const id = imageIdsMapping.get(image.id);
        const project = projects.find((p) => p.images?.find((img) => img.id === image.id));
        const projectId = project ? projectIdsMapping.get(project.id) : undefined;
        const vercelImage = project ? project.images?.find((img) => img.id === image.id) : undefined;

        console.log(image.id, id, project, projectId, vercelImage);

        if (!id || !project || !projectId || !vercelImage) {
            continue;
        }

        const pathname = `${id}.${image.blob.type.split("/")[1]}`;

        console.log("uploading:", pathname);

        const uploadedImage = await upload(pathname, image.blob, {
            access: "public",
            handleUploadUrl: "/api/projects/images/upload",
            clientPayload: JSON.stringify({
                id: id,
                projectId: projectId,
                title: vercelImage.title,
            }),
        });

        console.log("uploaded:", pathname);

        await cacheDataImage({
            id: id,
            projectId: projectId,
            title: vercelImage.title,
            vercelUrl: uploadedImage.url,
        }, image.blob);

        console.log("cached:", pathname);
    }
}

async function* getImages(zip: JSZip) {
    const files = zip.folder("images")?.files;

    if (!files) {
        console.log("files folder not found")
        return;
    }

    for (const [_, file] of Object.entries(files)) {
        const id = file.name.split(".")[0];

        console.log("found in zip:", file.name);

        const blob = await file.async("blob");

        console.log("extracted blob from zip:", file.name);

        yield { id, blob };
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