import { db } from "@/db";
import { ProjectBoardCheckItemSchema, ProjectBoardItemSchema, projectBoards, ProjectBoardSchema, ProjectBoardSectionSchema, projectDocuments, projects, vercelImages } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ExportedProject } from "../types/export/ExportedProject";
import { ExportedProjectBoard } from "../types/export/ExportedProjectBoard";
import { ExportedProjectBoardSection } from "../types/export/ExportedProjectBoardSection";
import { ExportedProjectBoardItem } from "../types/export/ExportedProjectBoardItem";
import { ExportedProjectBoardCheckItem } from "../types/export/ExportedProjectBoardCheckItem";

type DbBoards = Array<ProjectBoardSchema & {
    sections: Array<ProjectBoardSectionSchema & {
        items: Array<ProjectBoardItemSchema & {
            checkItems: Array<ProjectBoardCheckItemSchema>,
        }>
    }>
}>;

export async function exportProject(userId: string, projectId: string): Promise<ExportedProject | null> {
    const project = await db.query.projects.findFirst({
        where: and(eq(projects.userId, userId), eq(projects.id, projectId)),
    });

    if (!project) {
        return null;
    }

    const documents = await db.query.projectDocuments.findMany({
        where: and(eq(projectDocuments.userId, userId), eq(projectDocuments.projectId, projectId)),
    });
    const dbBoards = await db.query.projectBoards.findMany({
        where: and(eq(projectBoards.userId, userId), eq(projectBoards.projectId, projectId)),
        with: {
            sections: {
                with: {
                    items: {
                        with: {
                            checkItems: true,
                        }
                    }
                }
            }
        }
    });
    const images = await db.query.vercelImages.findMany({
        where: and(eq(vercelImages.userId, userId), eq(vercelImages.projectId, projectId)),
    });

    const boards = extractBoards(dbBoards);

    return {
        id: project.id,
        title: project.title,
        description: project.description,
        documents: documents.map((d) => ({
            id: d.id,
            projectId: d.projectId,
            title: d.title,
            content: d.content,
        })),
        boards: boards.boards.get(project.id) || [],
        boardSections: boards.boardSections.get(project.id) || [],
        boardItems: boards.boardItems.get(project.id) || [],
        boardCheckItems: boards.boardCheckItems.get(project.id) || [],
        images: images.map((img) => ({
            id: img.id,
            projectId: img.projectId,
            title: img.title,
            blobUrl: img.blobUrl,
        })),
    };
}

export async function exportProjectsByUser(userId: string): Promise<Array<ExportedProject>> {
    const dbProjects = await db.query.projects.findMany({
        where: and(eq(projects.userId, userId)),
    });

    if (dbProjects.length === 0) {
        return [];
    }

    const dbDocuments = await db.query.projectDocuments.findMany({
        where: and(eq(projectDocuments.userId, userId)),
    });
    const dbBoards = await db.query.projectBoards.findMany({
        where: and(eq(projectBoards.userId, userId)),
        with: {
            sections: {
                with: {
                    items: {
                        with: {
                            checkItems: true,
                        }
                    }
                }
            }
        }
    });
    const dbImages = await db.query.vercelImages.findMany({
        where: and(eq(vercelImages.userId, userId)),
    });

    const boards = extractBoards(dbBoards);

    return dbProjects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        documents: dbDocuments.filter((d) => d.projectId === p.id).map((d) => ({
            id: d.id,
            projectId: d.projectId,
            title: d.title,
            content: d.content,
        })),
        boards: boards.boards.get(p.id) || [],
        boardSections: boards.boardSections.get(p.id) || [],
        boardItems: boards.boardItems.get(p.id) || [],
        boardCheckItems: boards.boardCheckItems.get(p.id) || [],
        images: dbImages.filter((img) => img.projectId === p.id).map((img) => ({
            id: img.id,
            projectId: img.projectId,
            title: img.title,
            blobUrl: img.blobUrl,
        })),
    }));
}

function extractBoards(dbBoards: DbBoards): { 
    boards: Map<string, Array<ExportedProjectBoard>>,
    boardSections: Map<string, Array<ExportedProjectBoardSection>>,
    boardItems: Map<string, Array<ExportedProjectBoardItem>>,
    boardCheckItems: Map<string, Array<ExportedProjectBoardCheckItem>>,
} {
    const boards = new Map<string, Array<ExportedProjectBoard>>();
    const boardSections = new Map<string, Array<ExportedProjectBoardSection>>();
    const boardItems = new Map<string, Array<ExportedProjectBoardItem>>();
    const boardCheckItems = new Map<string, Array<ExportedProjectBoardCheckItem>>();

    for (const board of dbBoards) {
        addToMap(board.projectId, boards, [{
            id: board.id,
            projectId: board.projectId,
            title: board.title,
        }]);

        const sections = new Array<ExportedProjectBoardSection>();
        const items = new Array<ExportedProjectBoardItem>();
        const checkItems = new Array<ExportedProjectBoardCheckItem>();

        for (const section of board.sections) {
            sections.push({
                id: section.id,
                parentId: section.parentId,
                position: section.position,
                title: section.title,
            });

            for (const item of section.items) {
                items.push({
                    id: item.id,
                    parentId: item.parentId,
                    title: item.title,
                    isDone: item.isDone,
                    position: item.position,
                    description: item.description,
                });

                for (const checkItem of item.checkItems) {
                    checkItems.push({
                        id: checkItem.id,
                        parentId: checkItem.parentId,
                        title: checkItem.title,
                        isDone: checkItem.isDone,
                        position: checkItem.position,
                    });
                }
            }
        }

        addToMap(board.projectId, boardSections, sections);
        addToMap(board.projectId, boardItems, items);
        addToMap(board.projectId, boardCheckItems, checkItems);
    }

    return {
        boards,
        boardSections,
        boardItems,
        boardCheckItems,
    };
}

function addToMap<T>(key: string, map: Map<string, Array<T>>, newItems: Array<T>) {
    const items = map.get(key);

    if (!items) {
        map.set(key, newItems);
        return;
    }

    items.push(...newItems);
}