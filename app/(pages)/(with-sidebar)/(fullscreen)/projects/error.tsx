"use client";

import ErrorPageLayout from "@/app/components/error/ErrorPageLayout";

export default function ErrorPage(props: {
    error: Error & { digest?: string },
    reset: () => void,
}) {
    return (
        <ErrorPageLayout
            {...props} />
    );
}