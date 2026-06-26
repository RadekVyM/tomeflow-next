import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function createSearchIndexEntry(values: {
    title: string | null;
    type: string | null;
    targetId: string;
    projectId: string | null;
    userId: string;
    hierarchy?: string | null;
}) {
    await db.run(sql`
        INSERT INTO search_index (title, type, target_id, project_id, user_id, hierarchy)
        VALUES (
            ${values.title},
            ${values.type},
            ${values.targetId},
            ${values.projectId},
            ${values.userId},
            ${values.hierarchy ?? null});
    `);
}