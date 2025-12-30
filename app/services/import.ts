import { db } from "@/db";
import { projectBoardCheckItems, projectBoardItems, projectBoards, projectBoardSections, projectDocuments, projects } from "@/db/schema";
import { ExportedProject } from "../types/export/ExportedProject";

type InsertProject = {
    id: string,
    title: string,
    description: string | null,
}

type InsertProjectDocument = {
    id: string,
    title: string,
    content: string,
    projectId: string,
}

type InsertProjectBoard = {
    id: string,
    title: string,
    projectId: string,
}

type InsertProjectBoardSection = {
    id: string,
    title: string,
    parentId: string,
    position: number,
}

type InsertProjectBoardItem = {
    id: string,
    title: string,
    parentId: string,
    description: string | null,
    position: number,
    isDone: boolean,
}

type InsertProjectBoardCheckItem = {
    id: string,
    title: string,
    parentId: string,
    position: number,
    isDone: boolean,
}

export async function importProjects(userId: string, projects: Array<ExportedProject>) {
    const projectIdsMapping = new Array<{ old: string, new: string }>();
    const projectsToInsert = new Array<InsertProject>();
    const documentsToInsert = new Array<InsertProjectDocument>();
    const boardsToInsert = new Array<InsertProjectBoard>();
    const sectionsToInsert = new Array<InsertProjectBoardSection>();
    const itemsToInsert = new Array<InsertProjectBoardItem>();
    const checkItemsToInsert = new Array<InsertProjectBoardCheckItem>();

    for (const project of projects) {
        const projectId = crypto.randomUUID();
        const boardIdsMapping = new Map<string, string>();
        const sectionIdsMapping = new Map<string, string>();
        const itemIdsMapping = new Map<string, string>();

        projectIdsMapping.push({ old: project.id, new: projectId });

        projectsToInsert.push({
            id: projectId,
            description: project.description || null,
            title: project.title,
        });

        for (const document of project.documents) {
            const documentId = crypto.randomUUID();

            documentsToInsert.push({
                id: documentId,
                projectId: projectId,
                title: document.title,
                content: document.content,
            });
        }

        for (const board of project.boards) {
            const boardId = crypto.randomUUID();
            boardIdsMapping.set(board.id, boardId);

            boardsToInsert.push({
                id: boardId,
                projectId: projectId,
                title: board.title,
            });
        }

        for (const section of project.boardSections) {
            const sectionId = crypto.randomUUID();
            sectionIdsMapping.set(section.id, sectionId);

            sectionsToInsert.push({
                id: sectionId,
                parentId: boardIdsMapping.get(section.parentId)!,
                title: section.title,
                position: section.position,
            });
        }

        for (const item of project.boardItems) {
            const itemId = crypto.randomUUID();
            itemIdsMapping.set(item.id, itemId);

            itemsToInsert.push({
                id: itemId,
                parentId: sectionIdsMapping.get(item.parentId)!,
                title: item.title,
                position: item.position,
                description: item.description || null,
                isDone: item.isDone,
            });
        }

        for (const checkItem of project.boardCheckItems) {
            const checkItemId = crypto.randomUUID();

            checkItemsToInsert.push({
                id: checkItemId,
                parentId: itemIdsMapping.get(checkItem.parentId)!,
                title: checkItem.title,
                position: checkItem.position,
                isDone: checkItem.isDone,
            });
        }
    }

    await db.transaction(async () => {
        if (projectsToInsert.length > 0) {
            await insertProjects(userId, projectsToInsert);
        }
        if (documentsToInsert.length > 0) {
            await insertDocuments(userId, documentsToInsert);
        }
        if (boardsToInsert.length > 0) {
            await insertBoards(userId, boardsToInsert);
        }
        if (sectionsToInsert.length > 0) {
            await insertBoardSections(userId, sectionsToInsert);
        }
        if (itemsToInsert.length > 0) {
            await insertBoardItems(userId, itemsToInsert);
        }
        if (checkItemsToInsert.length > 0) {
            await insertBoardCheckItems(userId, checkItemsToInsert);
        }
    });

    return projectIdsMapping;
}

async function insertProjects(userId: string, newProjects: Array<InsertProject>) {
    const now = Date.now();

    await db.insert(projects).values(newProjects.map((p) => ({
        id: p.id,
        userId: userId,
        title: p.title,
        description: p.description,
        createdAt: now,
        updatedAt: now,
        lastRequestedAt: now,
    })));
}

async function insertDocuments(userId: string, newDocuments: Array<InsertProjectDocument>) {
    const now = Date.now();

    await db.insert(projectDocuments).values(newDocuments.map((d) => ({
        id: d.id,
        userId: userId,
        projectId: d.projectId,
        title: d.title,
        content: d.content,
        createdAt: now,
        updatedAt: now,
        lastRequestedAt: now,
    })));
}

async function insertBoards(userId: string, newBoards: Array<InsertProjectBoard>) {
    const now = Date.now();

    await db.insert(projectBoards).values(newBoards.map((b) => ({
        id: b.id,
        userId: userId,
        projectId: b.projectId,
        title: b.title,
        createdAt: now,
        updatedAt: now,
        lastRequestedAt: now,
    })));
}

async function insertBoardSections(userId: string, newSections: Array<InsertProjectBoardSection>) {
    const now = Date.now();

    await db.insert(projectBoardSections).values(newSections.map((s) => ({
        id: s.id,
        userId: userId,
        parentId: s.parentId,
        title: s.title,
        position: s.position,
        createdAt: now,
        updatedAt: now,
    })));
}

async function insertBoardItems(userId: string, newItems: Array<InsertProjectBoardItem>) {
    const now = Date.now();

    await db.insert(projectBoardItems).values(newItems.map((i) => ({
        id: i.id,
        userId: userId,
        parentId: i.parentId,
        title: i.title,
        position: i.position,
        description: i.description,
        isDone: i.isDone,
        createdAt: now,
        updatedAt: now,
        lastRequestedAt: now,
    })));
}

async function insertBoardCheckItems(userId: string, newCheckItems: Array<InsertProjectBoardCheckItem>) {
    const now = Date.now();

    await db.insert(projectBoardCheckItems).values(newCheckItems.map((c) => ({
        id: c.id,
        userId: userId,
        parentId: c.parentId,
        title: c.title,
        position: c.position,
        isDone: c.isDone,
        createdAt: now,
        updatedAt: now,
        lastRequestedAt: now,
    })));
}