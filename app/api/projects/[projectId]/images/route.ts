import { endpoint } from "@/app/api/utils";
import { getImagesFromProject } from "@/app/services/images";
import { NextResponse } from "next/server";

export const GET = endpoint<{ projectId: string }>(async ({ params, userId }) => {
    const { projectId } = params;

    const images = await getImagesFromProject(userId, projectId);

    return NextResponse.json(images.map((image) => ({ id: image.id })));
});