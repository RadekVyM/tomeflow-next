"use client";

import CardList from "@/app/components/card-list/CardList";
import CardListItem from "@/app/components/card-list/CardListItem";
import ContentItemListHeading from "@/app/components/layout/ContentItemListHeading";
import useDebouncedValue from "@/app/hooks/useDebouncedValue";
import { lastSeenAt } from "@/app/utils/entities";
import { removeAccents } from "@/app/utils/string";
import { cn } from "@/app/utils/tailwind";
import { ProjectBoardSchema, ProjectDocumentSchema } from "@/db/schema";
import { useState } from "react";
import { TbFile, TbLayoutDashboard, TbSearch } from "react-icons/tb";

export default function DocumentBoardsList(props: {
    projectId: string,
    boards: Array<ProjectBoardSchema>,
    documents: Array<ProjectDocumentSchema>,
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebouncedValue(searchQuery, 100) || "";

    const searchTerms = debouncedSearchQuery.split(" ").map((s) => removeAccents(s.trim().toLowerCase())).filter((s) => s.length > 0);

    const filteredBoards = searchTerms.length > 0 ?
        props.boards.filter((board) => searchTerms.every((term) => removeAccents(board.title).toLowerCase().includes(term))) :
        props.boards;

    const filteredDocuments = searchTerms.length > 0 ?
        props.documents.filter((document) => searchTerms.every((term) => removeAccents(document.title).toLowerCase().includes(term))) :
        props.documents;

    return (
        <>
            <div
                className="relative mb-4">
                <input
                    className="py-1.5 pl-2.5 pr-8 bg-surface-container border border-outline-variant outline-primary hover:border-outline rounded-xl w-full"
                    placeholder="Search project..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} />
                <TbSearch
                    className="absolute right-3 top-3 pointer-events-none text-on-surface-container-muted" />
            </div>

            {filteredBoards.length > 0 &&
                <>
                    <ContentItemListHeading
                        as="h4">
                        Boards
                    </ContentItemListHeading>
                    <CardList>
                        {filteredBoards.map((board) =>
                            <CardListItem
                                key={board.id}
                                href={`/projects/${props.projectId}/boards/${board.id}`}
                                title={board.title}
                                titleAs="h4"
                                lastSeenDate={new Date(lastSeenAt(board))}
                                icon={TbLayoutDashboard} />)}
                    </CardList>
                </>}

            {filteredDocuments.length > 0 &&
                <>
                    <ContentItemListHeading
                        className={cn(filteredBoards.length > 0 && "mt-4")}
                        as="h4">
                        Documents
                    </ContentItemListHeading>
                    <CardList>
                        {filteredDocuments.map((document) =>
                            <CardListItem
                                key={document.id}
                                href={`/projects/${props.projectId}/documents/${document.id}`}
                                title={document.title}
                                titleAs="h4"
                                lastSeenDate={new Date(lastSeenAt(document))}
                                icon={TbFile} />)}
                    </CardList>
                </>}

            {filteredBoards.length === 0 && filteredDocuments.length === 0 &&
                <div
                    className="text-center text-sm text-on-surface-muted">
                    No boards or projects found
                </div>}
        </>
    );
}