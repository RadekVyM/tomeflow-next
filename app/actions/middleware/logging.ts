import { createMiddleware } from "next-safe-action";

export const loggingMiddleware = createMiddleware().define(async ({ next, clientInput }) => {
    const result = await next({ ctx: undefined });

    if (process.env.NODE_ENV === "development") {
        console.debug({ clientInput }, "Input");
        console.debug({ result: result.data }, "Result");
    }

    return result;
});