"use client";

import { importProjectsAction } from "@/app/actions/import";
import LoadingIcon from "@/app/components/LoadingIcon";
import { MoreDropdownListButton } from "@/app/components/MoreDropdownButton";
import toast from "@/app/components/toast";
import { importProjectsFromZip } from "@/app/services/client/import";
import { useAction } from "next-safe-action/hooks";
import { useRef } from "react";
import { IconType } from "react-icons";
import { LuCircleCheck, LuUpload } from "react-icons/lu";

// TODO: The upload state should be managed globally

export default function ImportButton() {
    // TODO: Handle invalid inputs
    const closeToastRef = useRef<(title: string, icon?: IconType) => boolean>(null);
    const action = useAction(importProjectsAction, {
        onSuccess: () => {
            closeToastRef.current?.("Imported projects successfully", LuCircleCheck);
            closeToastRef.current = toast("Importing images...", "permanent", LoadingIcon) || null;
        },
        onError: () => errorToast(),
    });

    function onImportClick() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".zip";
        input.style.display = "none";

        input.addEventListener("change", async () => {
            const file = input?.files?.[0];

            closeToastRef.current = toast("Importing projects...", "permanent", LoadingIcon) || null;

            try {
                if (!file) {
                    throw new Error("No file found");
                }

                await importProjectsFromZip(file, async (projects) => {
                    const result = await action.executeAsync(projects);
                    return result.data;
                });

                closeToastRef.current?.("Imported images successfully", LuCircleCheck);
                closeToastRef.current = null;
            }
            catch (e) {
                console.error(e);
                errorToast();
            }
            finally {
                document.body.removeChild(input);
            }
        });

        document.body.appendChild(input);
        input.click();
    }

    function errorToast() {
        closeToastRef.current?.("Failed importing projects");
        closeToastRef.current = null;
    }

    return (
        <MoreDropdownListButton
            onClick={onImportClick}
            icon={LuUpload}
            title="Import projects" />
    );
}