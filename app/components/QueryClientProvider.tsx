"use client";

import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from "@tanstack/react-query";
import React from "react";

const queryClient = new QueryClient();

export default function QueryClientProvider(props: {
    children: React.ReactNode,
}) {
    return (
        <ReactQueryClientProvider
            client={queryClient}>
            {props.children}
        </ReactQueryClientProvider>
    )
}