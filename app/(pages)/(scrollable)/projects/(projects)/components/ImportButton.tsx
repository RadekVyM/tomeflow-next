"use client";

import { importProjectsAction } from "@/app/actions/import";
import LoadingIcon from "@/app/components/LoadingIcon";
import { MoreDropdownListButton } from "@/app/components/MoreDropdownButton";
import toast from "@/app/components/toast";
import { importProjectsFromZip, uploadImages } from "@/app/services/client/import";
import { ExportedProject } from "@/app/types/export/ExportedProject";
import { LuCircleCheck, LuUpload } from "react-icons/lu";

export default function ImportButton() {
    function onImportClick() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".zip";
        input.style.display = "none";

        input.addEventListener("change", async () => {
            const file = input?.files?.[0];

            try {
                if (!file) {
                    toast("Found no file to import");
                    throw new Error("No file found");
                }

                const result = await importProjects(file);

                if (!result || !result.hasImages) {
                    return;
                }

                await importImages(file, result.projects, result.projectIdsMapping, result.imageIdsMapping);
            }
            finally {
                document.body.removeChild(input);
            }
        });

        document.body.appendChild(input);
        input.click();
    }

    return (
        <MoreDropdownListButton
            onClick={onImportClick}
            icon={LuUpload}
            title="Import projects" />
    );
}

async function importProjects(file: File) {
    const closeToast = toast("Importing projects...", "permanent", LoadingIcon) || null;

    try {
        if (!file) {
            throw new Error("No file found");
        }

        const result = await importProjectsFromZip(file, async (projects) => {
            const result = await importProjectsAction(projects);

            if (result.serverError || result.validationErrors) {
                throw new Error("Projects upload failed");
            }

            return result.data;
        });

        if (!result) {
            throw new Error("Projects upload failed");
        }

        closeToast?.("Imported projects successfully", LuCircleCheck);

        return result;
    }
    catch (e) {
        console.error(e);
        closeToast?.("Failed importing projects");
        return;
    }
}

async function importImages(
    file: File,
    projects: Array<ExportedProject>,
    projectIdsMapping: Map<string, string>,
    imageIdsMapping: Map<string, string>,
) {
    const closeToast = toast("Importing images...", "permanent", LoadingIcon) || null;

    try {
        await uploadImages(file, projects, projectIdsMapping, imageIdsMapping);
        closeToast?.("Imported images successfully", LuCircleCheck);
    }
    catch (e) {
        console.error(e);
        closeToast?.("Failed importing images");
    }
}