import { endpoint } from "@/app/api/utils";
import { exportProjectsByUser } from "@/app/services/export";
import { NextResponse } from "next/server";

export const GET = endpoint(async ({ params, userId }) => {
    const projects = await exportProjectsByUser(userId);

    if (projects === null) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(projects);
});