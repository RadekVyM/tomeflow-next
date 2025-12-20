"use client";

import { QueryClientProvider as ReactQueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { getQueryClient } from "./getQueryClient";

export default function QueryClientProvider(props: {
    children: React.ReactNode,
}) {
    const queryClient = getQueryClient();

    return (
        <ReactQueryClientProvider
            client={queryClient}>
            {props.children}
        </ReactQueryClientProvider>
    )
}