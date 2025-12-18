import { endpoint, ok } from "@/app/api/utils";
import { deleteImage } from "@/app/services/images";

export const DELETE = endpoint<{ imageId: string }>(async ({ params, userId }) => {
    const { imageId } = params;

    await deleteImage(userId, imageId);

    return ok();
});