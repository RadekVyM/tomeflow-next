"use client";

import { MoreDropdownListButton } from "@/app/components/MoreDropdownButton";
import { downloadExportedData } from "@/app/services/client/export";
import { LuDownload } from "react-icons/lu";

export default function ExportButton() {
    async function onExportClick() {
        await downloadExportedData("/api/projects/export", "projects");
    }

    return (
        <MoreDropdownListButton
            onClick={onExportClick}
            icon={LuDownload}
            title="Export projects" />
    );
}