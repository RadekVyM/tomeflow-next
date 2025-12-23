import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { createImage } from "@/app/services/images";
import z from "zod";

const ClientPayloadSchema = z.object({
    id: z.uuid().nonempty(),
    projectId: z.uuid().nonempty(),
    title: z.string().nonempty(),
});

const TokenPayloadSchema = z.object({
    id: z.uuid().nonempty(),
    userId: z.uuid().nonempty(),
    projectId: z.uuid().nonempty(),
    title: z.string().nonempty(),
});

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

                const parsedPayload = ClientPayloadSchema.safeParse(JSON.parse(clientPayload));

                if (parsedPayload.error) {
                    throw new Error("Client payload is missing some properties or they are in wrong format.");
                }

                const session = await auth();

                if (!session?.user?.id) {
                    throw new Error("Not authenticated");
                }
                const userId = session.user.id;

                const { id, title, projectId } = parsedPayload.data;

                return {
                    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
                    addRandomSuffix: true,
                    tokenPayload: JSON.stringify({
                        id,
                        userId,
                        projectId,
                        title,
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log("Blob upload completed", blob, tokenPayload);

                if (!tokenPayload) {
                    throw new Error();
                }

                const parsedPayload = TokenPayloadSchema.safeParse(JSON.parse(tokenPayload));

                if (parsedPayload.error) {
                    throw new Error("Payload is missing some properties or they are in wrong format.");
                }

                try {
                    const { id, userId, title, projectId } = parsedPayload.data;
                    await createImage(id, blob.url, title, projectId, userId);
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