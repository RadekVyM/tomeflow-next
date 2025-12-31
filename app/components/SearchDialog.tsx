"use client";

import { useEffect, useRef, useState } from "react";
import { DialogState } from "../types/DialogState";
import ContentDialog from "./ContentDialog";
import { useQuery } from "@tanstack/react-query";
import useDebouncedValue from "../hooks/useDebouncedValue";

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
            {props.state.isOpen && <Content />}
        </ContentDialog>
    );
}

function Content() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
    const { data: result } = useSearch(debouncedSearchQuery);

    useEffect(() => inputRef.current?.focus(), []);

    return (
        <>
            <input
                ref={inputRef}
                className="py-1 px-2 bg-surface-container border border-outline rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />

            <ul>
                {result?.map((item: any) =>
                    <li
                        key={item.id}>
                        {item.title}
                    </li>)}
            </ul>
        </>
    );
}

function useSearch(searchQuery: string) {
    return useQuery({
        queryKey: ["search", { searchQuery }],
        queryFn: ({ signal }) => fetch(`/api/search?query=${searchQuery}`, { signal })
            .then((res) => res.json())
            .then((data) => data as any),
    });
}