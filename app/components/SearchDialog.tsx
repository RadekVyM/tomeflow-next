"use client";

import { useEffect, useRef, useState } from "react";
import { DialogState } from "../types/DialogState";
import ContentDialog from "./ContentDialog";
import { useQuery } from "@tanstack/react-query";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { SearchResult } from "../types/SearchResult";
import Button from "./input/Button";
import { IconType } from "react-icons";
import { LuChevronRight, LuCircle, LuColumns3, LuFile, LuLayoutDashboard, LuPackage, LuSquareCheck, LuSquareCheckBig } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { isNullOrWhiteSpace } from "../utils/string";
import { cn } from "../utils/tailwind";
import Skeleton from "./skeleton/Skeleton";

const ARROW_DOWN_KEY = "ArrowDown";
const ARROW_UP_KEY = "ArrowUp";

export default function SearchDialog(props: {
    state: DialogState,
}) {
    return (
        <ContentDialog
            ref={props.state.dialogRef}
            state={props.state}
            outerClassName="items-start py-10"
            className="max-w-2xl max-h-full mt-0"
            heading="Search">
            {props.state.isOpen && <Content state={props.state} />}
        </ContentDialog>
    );
}

function Content(props: {
    state: DialogState,
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
    const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
    const { data: result, error, isPending } = useSearch(debouncedSearchQuery);
    const router = useRouter();

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 200);
    }, []);

    useEffect(() => {
        setSelectedResult(isFocused && result && result.length > 0 ? result[0] : null);
    }, [result, isFocused]);

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (selectedResult) {
            props.state.hide();
            router.push(selectedResult.url);
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
        if (e.key == ARROW_DOWN_KEY || e.key == ARROW_UP_KEY) {
            e.preventDefault();

            if (!result || !result.length) {
                return;
            }

            let index = result.findIndex((s) => s === selectedResult);
            index = index < 0 ? 0 : index;
            let newIndex = index + (e.key == ARROW_DOWN_KEY ? 1 : -1);
            newIndex = newIndex < 0 ?
                result.length - 1 :
                newIndex >= result.length ?
                    0 :
                    newIndex;

            setSelectedResult(result[newIndex]);
        }
    }

    if (error) {
        return (
            <div>
                Search failed...
            </div>
        );
    }

    return (
        <form
            onSubmit={onSubmit}
            onKeyDown={onKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full">
            <input
                ref={inputRef}
                className="py-1 px-2 bg-surface-container border border-outline rounded-lg w-full outline-primary"
                placeholder="Find anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />

            {error ?
                <div>
                    Search failed...
                </div> :
                <ul
                    className="divide-y divide-outline-variant mt-2">
                    {isPending ?
                        <ResultsSkeleton /> :
                        result?.map((item) =>
                            <li
                                key={item.id}
                                className="py-1">
                                <Button
                                    type="button"
                                    className="w-full px-1.5 py-1.5 gap-2.5"
                                    variant={isFocused && selectedResult?.id === item.id ? "primary" : "default"}
                                    onClick={() => {
                                        props.state.hide();
                                        router.push(item.url);
                                    }}>
                                    <ResultContent
                                        title={item.title}
                                        icon={resultToIcon(item)}
                                        projectTitle={projectTitle(item)}
                                        subProjectTitle={boardTitle(item)}
                                        isSelected={isFocused && selectedResult?.id === item.id} />
                                </Button>
                            </li>)}
                </ul>}
        </form>
    );
}

function ResultContent(props: {
    title: string,
    projectTitle?: string,
    subProjectTitle?: string,
    isSelected: boolean,
    icon: IconType,
}) {
    const Icon = props.icon;

    return (
        <>
            <div
                className="bg-primary-lite p-1.5 rounded-lg">
                <Icon
                    className="text-primary dark:text-primary-dim w-3.5 h-3.5" />
            </div>

            <div
                className="flex flex-col items-start text-start">
                <span>{props.title}</span>
                {props.projectTitle &&
                    <div
                        className={cn("flex gap-1 items-center text-sm text-on-surface-container-muted transition-colors", props.isSelected && "text-on-primary")}>
                        <div>{props.projectTitle}</div>
                        {props.subProjectTitle &&
                            <>
                                <LuChevronRight />
                                <div>{props.subProjectTitle}</div>
                            </>}
                    </div>}
            </div>
        </>
    );
}

function ResultsSkeleton() {
    return (
        <>
            {new Array(3).fill(null).map((_, index) => 
                <li
                    key={index}
                    className="py-1">
                    <Skeleton
                        className="h-10 rounded-lg" />
                </li>)}
        </>  
    );
}

function useSearch(searchQuery: string) {
    searchQuery = isNullOrWhiteSpace(searchQuery) ? "" : searchQuery.trim();

    return useQuery({
        queryKey: ["search", { searchQuery }],
        queryFn: ({ signal }) => fetch(`/api/search?query=${searchQuery}`, { signal })
            .then((res) => res.json())
            .then((data) => data as Array<SearchResult>),
    });
}

function resultToIcon(result: SearchResult) {
    switch (result.type) {
        case "project":
            return LuPackage;
        case "board":
            return LuLayoutDashboard;
        case "document":
            return LuFile;
        case "section":
            return LuColumns3;
        case "item":
            return LuSquareCheckBig;
        case "check-item":
            return LuSquareCheck;
    }

    return LuCircle;
}

function projectTitle(result: SearchResult) {
    if (result.type !== "project") {
        return result.projectTitle;
    }
    return undefined;
}

function boardTitle(result: SearchResult) {
    if (result.type === "item" || result.type === "section" || result.type === "check-item") {
        return result.boardTitle;
    }
    return undefined;
}