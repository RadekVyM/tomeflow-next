// https://github.com/iansbrash/youtube/blob/main/nextjs-production-grade-server-actions/actions/safe-action.ts

import { DrizzleError } from "drizzle-orm";
import { createSafeActionClient } from "next-safe-action";
import { ZodError } from "zod";
import { loggingMiddleware } from "./middleware/logging";
import { authenticationMiddleware } from "./middleware/auth";

export const VALIDATION_ERROR_MESSAGE = "An error occurred validating your input.";
export const DATABASE_ERROR_MESSAGE = "An error occurred with our database.";
export const DEFAULT_SERVER_ERROR_MESSAGE = "Something really bad happened on the server 🫠";

export const actionClientWithMeta = createSafeActionClient({
    handleServerError(e) {
        if (e instanceof ZodError) {
            console.error(e.message);
            return VALIDATION_ERROR_MESSAGE;
        }
        else if (e instanceof DrizzleError) {
            console.error(e.message);
            return DATABASE_ERROR_MESSAGE;
        }
        else if (e instanceof Error) {
            return e.message;
        }

        return DEFAULT_SERVER_ERROR_MESSAGE;
    },
});

export const noauthActionClient = actionClientWithMeta
    .use(loggingMiddleware);

export const authActionClient = actionClientWithMeta
    .use(loggingMiddleware)
    .use(authenticationMiddleware);