import { endpoint, ok } from "@/app/api/utils";
import { createImage, getImagesFromProject } from "@/app/services/images";
import { NextResponse } from "next/server";
import z from "zod";

const PostImageSchema = z.object({
    dataUrl: z.string().nonempty(),
    title: z.string().nonempty(),
});

type PostImage = z.infer<typeof PostImageSchema>

export const GET = endpoint<{ projectId: string }>(async ({ params, userId }) => {
    const { projectId } = params;

    const images = await getImagesFromProject(userId, projectId);

    return NextResponse.json(images.map((image) => ({ id: image.id })));
});

export const POST = endpoint<{ projectId: string }, PostImage>(async ({ params, userId, data }) => {
    const { projectId } = params;

    await createImage(data.dataUrl, data.title, projectId, userId);

    return ok();
}, PostImageSchema);