import { db } from "@/db";
import { projectBoardCheckItems, projectBoardItems, projectBoards, projectBoardSections, projects, searchIndex } from "@/db/schema";
import { and, sql, eq, desc } from "drizzle-orm";
import { isNullOrWhiteSpace } from "../utils/string";
import { ProjectSearchResult, SearchResult } from "../types/SearchResult";
import { cache } from "react";

export async function performSearch(query: string, userId: string): Promise<Array<SearchResult>> {
    if (isNullOrWhiteSpace(query)) {
        return await getDefaultSearchResults(userId);
    }

    const searchItems = await getSearchItems(query, userId);

    const result = new Array<SearchResult>();

    for (const searchItem of searchItems) {
        if (!searchItem.id || !searchItem.title || !searchItem.type) {
            continue;
        }

        if (!searchItem.projectId) {
            continue;
        }

        if (searchItem.type === "project") {
            result.push({
                type: "project",
                id: searchItem.id,
                title: searchItem.title,
                url: `/projects/${searchItem.id}`,
            });
            continue;
        }

        const project = await getProject(searchItem.projectId, userId);

        if (!project) {
            continue;
        }

        switch (searchItem.type) {
            case "board":
                result.push({
                    type: "board",
                    id: searchItem.id,
                    title: searchItem.title,
                    projectId: project.id,
                    projectTitle: project.title,
                    url: `/projects/${project.id}/boards/${searchItem.id}`,
                });
                break;
            case "document":
                result.push({
                    type: "document",
                    id: searchItem.id,
                    title: searchItem.title,
                    projectId: project.id,
                    projectTitle: project.title,
                    url: `/projects/${project.id}/documents/${searchItem.id}`,
                });
                break;
            case "section": 
                const section = await getSection(searchItem.id, userId);

                if (!section) {
                    continue;
                }

                result.push({
                    type: "section",
                    id: searchItem.id,
                    title: searchItem.title,
                    projectId: project.id,
                    projectTitle: project.title,
                    boardId: section.board.id,
                    boardTitle: section.board.title,
                    url: `/projects/${project.id}/boards/${section.board.id}`,
                });
                break;
            case "item":
                const item = await getItem(searchItem.id, userId);

                if (!item) {
                    continue;
                }

                result.push({
                    type: "item",
                    id: searchItem.id,
                    title: searchItem.title,
                    projectId: project.id,
                    projectTitle: project.title,
                    boardId: item.section.board.id,
                    boardTitle: item.section.board.title,
                    url: `/projects/${project.id}/boards/${item.section.board.id}?itemId=${searchItem.id}`,
                });
                break;
            case "check_item":
                const checkItem = await getCheckItem(searchItem.id, userId);

                if (!checkItem) {
                    continue;
                }

                result.push({
                    type: "check-item",
                    id: searchItem.id,
                    title: searchItem.title,
                    projectId: project.id,
                    projectTitle: project.title,
                    boardId: checkItem.item.section.board.id,
                    boardTitle: checkItem.item.section.board.title,
                    url: `/projects/${project.id}/boards/${checkItem.item.section.board.id}?itemId=${checkItem.item.id}`,
                });
                break;
        }
    }

    return result;
}

async function getSearchItems(query: string, userId: string) {
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
        score: sql<number> `bm25(${searchIndex}, ${weights})`,
    })
        .from(searchIndex)
        .where(
            and(
                eq(searchIndex.userId, userId),
                sql`${searchIndex} MATCH ${sanitizedQuery}`))
        .orderBy(sql`bm25(${searchIndex}, ${weights})`)
        .limit(6);
}

async function getDefaultSearchResults(userId: string): Promise<Array<ProjectSearchResult>> {
    const dbProjects = await db.query.projects.findMany({
        where: and(eq(projects.userId, userId)),
        orderBy: [desc(projectBoards.lastRequestedAt)],
        limit: 6,
        columns: {
            id: true,
            title: true,
        },
    });

    return dbProjects.map((project) => ({
        id: project.id,
        title: project.title,
        type: "project",
        url: `/projects/${project.id}`,
    }));
}

const getProject = cache(async (projectId: string, userId: string) => {
    return await db.query.projects.findFirst({
        where: and(eq(projects.userId, userId), eq(projects.id, projectId)),
        columns: {
            id: true,
            title: true,
        },
    });
});

const getSection = cache(async (sectionId: string, userId: string) => {
    return await db.query.projectBoardSections.findFirst({
        where: and(eq(projectBoardSections.userId, userId), eq(projectBoardSections.id, sectionId)),
        with: {
            board: {
                columns: {
                    id: true,
                    title: true,
                },
            },
        },
        columns: {},
    });
});

const getItem = cache(async (itemId: string, userId: string) => {
    return await db.query.projectBoardItems.findFirst({
        where: and(eq(projectBoardItems.userId, userId), eq(projectBoardItems.id, itemId)),
        with: {
            section: {
                with: {
                    board: {
                        columns: {
                            id: true,
                            title: true,
                        },
                    },
                },
                columns: { },
            },
        },
        columns: {},
    });
});

const getCheckItem = cache(async (checkItemId: string, userId: string) => {
    return await db.query.projectBoardCheckItems.findFirst({
        where: and(eq(projectBoardCheckItems.userId, userId), eq(projectBoardCheckItems.id, checkItemId)),
        with: {
            item: {
                with: {
                    section: {
                        with: {
                            board: {
                                columns: {
                                    id: true,
                                    title: true,
                                },
                            },
                                },
                        columns: { },
                    },
                },
                columns: {
                    id: true,
                },
            },
        },
        columns: {},
    });
});