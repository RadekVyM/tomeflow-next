"use client";

import LoadingIcon from "@/app/components/LoadingIcon";
import { MoreDropdownListButton } from "@/app/components/MoreDropdownButton";
import toast from "@/app/components/toast";
import { downloadExportedData } from "@/app/services/client/export";
import { TbCircleCheck, TbDownload } from "react-icons/tb";

export default function ExportButton() {
    async function onExportClick() {
        const closeToast = toast("Exporting projects...", "permanent", LoadingIcon);

        try {
            await downloadExportedData("/api/projects/export", "projects");
            closeToast?.("Exported projects successfully", TbCircleCheck);
        }
        catch (e) {
            console.error(e);
            closeToast?.("Failed exporting projects");
        }
    }

    return (
        <MoreDropdownListButton
            onClick={onExportClick}
            icon={TbDownload}
            title="Export projects" />
    );
}