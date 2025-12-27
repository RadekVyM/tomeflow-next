import { endpoint } from "@/app/api/utils";
import { exportProject } from "@/app/services/export";
import { NextResponse } from "next/server";

export const GET = endpoint<{ projectId: string }>(async ({ params, userId }) => {
    const { projectId } = params;
    const project = await exportProject(userId, projectId);

    if (project === null) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json([project]);
});