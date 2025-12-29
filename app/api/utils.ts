import { auth } from "@/auth";
import { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";
import z from "zod";

export function endpoint<TParams = any, TData = undefined>(
    handler: (props: { request: NextAuthRequest, params: TParams, data: TData, userId: string, }) => Promise<NextResponse>,
    schema?: z.ZodType<TData>,
) {
    return auth(async (request, context) => {
        if (!request.auth) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }

        const params = (await context.params ?? {}) as TParams;

        try {
            if (schema) {
                const body = await request.text();
                const result = schema.safeParse(JSON.parse(body));

                if (!result.success) {
                    return NextResponse.json(result.error.message, { status: 400 });
                }

                return await handler({ request, params, data: result.data, userId: request.auth.user?.id! });
            }

            return await handler({ request, params, data: undefined as TData, userId: request.auth.user?.id! });
        }
        catch (e) {
            console.log(e);
            return NextResponse.json({ message: "Something bad happened on the server side" }, { status: 500 });
        }
    });
}

export function ok(data?: any): NextResponse {
    return NextResponse.json({
        message: "Success",
        ...data,
    }, { status: 200 });
}