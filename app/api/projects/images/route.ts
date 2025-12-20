import { NextResponse } from "next/server";
import { endpoint } from "../../utils";
import z from "zod";
import { getImages } from "@/app/services/images";
import { DataImage } from "@/app/types/DataImage";

const ImageIdsSchema = z.object({
    imageIds: z.array(z.string()),
});

export const POST = endpoint(async ({ userId, data }) => {
    const images = await getImages(userId, data.imageIds);

    return NextResponse.json<Array<DataImage>>(images.map((image) => ({
        id: image.id,
        projectId: image.projectId,
        title: image.title,
        dataUrl: image.imageData,
    })));
}, ImageIdsSchema);