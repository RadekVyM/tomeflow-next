import { NextResponse } from "next/server";
import { endpoint } from "../utils";
import { performSearch } from "@/app/services/search";

export const GET = endpoint(async ({ request, userId }) => {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get("query") || "";
    const result = await performSearch(query, userId);

    return NextResponse.json(result);
});