"use client"

import { MoreDropdownListButton } from "@/app/components/MoreDropdownButton";
import { LuDownload } from "react-icons/lu";

export default function ExportButton() {
    async function onExportClick() {
        //await downloadExportedData("/api/export/projects", "projects");
    }

    return (
        <MoreDropdownListButton
            onClick={onExportClick}
            icon={LuDownload}
            title="Export projects" />
    );
}