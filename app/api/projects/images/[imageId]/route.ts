import { endpoint, ok } from "@/app/api/utils";
import { deleteImage, getImage } from "@/app/services/images";
import { DataImage } from "@/app/types/DataImage";
import { NextResponse } from "next/server";

export const GET = endpoint<{ imageId: string }>(async ({ params, userId }) => {
    const { imageId } = params;

    const image = await getImage(userId, imageId);

    if (!image) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const result: DataImage = {
        id: image.id,
        projectId: image.projectId,
        title: image.title,
        dataUrl: image.imageData,
    };

    return ok(result);
});

export const DELETE = endpoint<{ imageId: string }>(async ({ params, userId }) => {
    const { imageId } = params;

    await deleteImage(userId, imageId);

    return ok();
});