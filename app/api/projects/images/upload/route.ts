import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { createImage } from "@/app/services/images";

export const POST = async (request: NextRequest) => {
    const body = (await request.json()) as HandleUploadBody;
    
    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                if (!clientPayload) {
                    throw new Error("Client payload is missing.");
                }

                const session = await auth();

                if (!session?.user?.id) {
                    throw new Error("Not authenticated");
                }
                const userId = session.user.id;

                const { title, projectId } = JSON.parse(clientPayload);

                return {
                    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
                    addRandomSuffix: true,
                    tokenPayload: JSON.stringify({
                        userId,
                        projectId,
                        title,
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log("blob upload completed", blob, tokenPayload);

                try {
                    if (!tokenPayload) {
                        throw new Error();
                    }

                    const { userId, title, projectId } = JSON.parse(tokenPayload);

                    await createImage(blob.url, title, projectId, userId);
                }
                catch (error) {
                    throw new Error("Could not save the image metadata to the database.");
                }
            },
        });

        return NextResponse.json(jsonResponse);
    }
    catch (error) {
        console.log((error as Error).message);

        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
};