import { auth } from "@/auth";
import { Session } from "next-auth";
import { createMiddleware } from "next-safe-action";

export const authenticationMiddleware = createMiddleware().define(async ({ next }) => {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    return next({
        ctx: {
            session: session as Session,
        },
    });
});