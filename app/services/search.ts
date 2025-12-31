import { db } from "@/db";
import { searchIndex } from "@/db/schema";
import { and, sql, eq } from "drizzle-orm";
import { isNullOrWhiteSpace } from "../utils/string";

export async function performSearch(query: string, userId: string) {
    if (isNullOrWhiteSpace(query)) {
        return [];
    }

    const weights = sql`10.0, 0.0, 0.0, 0.0, 0.0, 5.0`;
    const sanitizedQuery = `{title hierarchy}: ${query
        .trim()
        .split(/\s+/)
        .map(word => `${word}`)
        .join(" ")}`;

    return await db.select({
        id: searchIndex.targetId,
        title: searchIndex.title,
        type: searchIndex.type,
        projectId: searchIndex.projectId,
        path: searchIndex.hierarchy,
        score: sql<number>`bm25(${searchIndex}, ${weights})`,
    })
        .from(searchIndex)
        .where(
            and(
                eq(searchIndex.userId, userId),
                sql`${searchIndex} MATCH ${sanitizedQuery}`))
        .orderBy(sql`bm25(${searchIndex}, ${weights})`)
        .limit(25);
}