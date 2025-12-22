import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getSessionCached = cache(async () => {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/");
    }

    return session as {
        expires: string,
        user: {
            id: string,
            name: string | null,
            email: string | null,
            image: string | null,
        },
    };
});