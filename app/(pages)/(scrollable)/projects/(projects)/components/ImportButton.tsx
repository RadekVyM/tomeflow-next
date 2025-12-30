"use client";

import { importProjectsAction } from "@/app/actions/import";
import LoadingIcon from "@/app/components/LoadingIcon";
import { MoreDropdownListButton } from "@/app/components/MoreDropdownButton";
import toast from "@/app/components/toast";
import { useAction } from "next-safe-action/hooks";
import { useRef } from "react";
import { IconType } from "react-icons";
import { LuCircleCheck, LuUpload } from "react-icons/lu";

export default function ImportButton() {
    // TODO: Handle invalid inputs
    const closeToastRef = useRef<(title: string, icon?: IconType) => boolean>(null);
    const action = useAction(importProjectsAction, {
        onSuccess: () => {
            closeToastRef.current?.("Imported projects successfully", LuCircleCheck);
            closeToastRef.current = null;
        },
        onError: () => errorToast(),
    });

    function onImportClick() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.style.display = "none";

        input.addEventListener("change", () => {
            const file = input?.files?.[0];

            if (file) {
                closeToastRef.current = toast("Importing projects...", "permanent", LoadingIcon) || null;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = e.target?.result?.toString();

                        if (!data) {
                            throw new Error("Data could not be loaded from the file");
                        }

                        let json = data.trim();
                        if (!json.startsWith("[")) {
                            json = `[${json}]`;
                        }
                        const parsedData = JSON.parse(json);

                        if (!parsedData) {
                            throw new Error("Data could not be parsed");
                        }

                        action.execute(parsedData);
                    }
                    catch (e) {
                        console.error(e);
                        errorToast();
                    }
                    finally {
                        document.body.removeChild(input);
                    }
                };
                reader.readAsText(file);
            }
            else {
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