import { NextResponse } from "next/server";
import { endpoint } from "../../utils";
import z from "zod";
import { getImages } from "@/app/services/images";
import { VercelImage } from "@/app/types/VercelImage";

const ImageIdsSchema = z.object({
    imageIds: z.array(z.uuid()),
});

export const POST = endpoint(async ({ userId, data }) => {
    const images = await getImages(userId, data.imageIds);

    return NextResponse.json<Array<VercelImage>>(images.map((image) => ({
        id: image.id,
        projectId: image.projectId,
        title: image.title,
        vercelUrl: image.blobUrl,
    })));
}, ImageIdsSchema);