"use client";

import { importProjectsAction } from "@/app/actions/import";
import { MoreDropdownListButton } from "@/app/components/MoreDropdownButton";
import toast from "@/app/components/toast";
import { useAction } from "next-safe-action/hooks";
import { LuUpload } from "react-icons/lu";

export default function ImportButton() {
    // TODO: Handle wrong inputs and other errors
    const action = useAction(importProjectsAction, {
        onError: () => toast("Failed to import the projects"),
    });

    function onImportClick() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.style.display = "none";

        input.addEventListener("change", () => {
            const file = input?.files?.[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = e.target?.result?.toString();

                    if (data) {
                        let json = data.trim();
                        if (!json.startsWith("[")) {
                            json = `[${json}]`;
                        }
                        action.execute(JSON.parse(json));
                    }

                    document.body.removeChild(input);
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

    return (
        <MoreDropdownListButton
            onClick={onImportClick}
            icon={LuUpload}
            title="Import projects" />
    );
}