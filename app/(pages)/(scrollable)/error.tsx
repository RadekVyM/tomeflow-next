"use client";

import ErrorPageContent from "@/app/components/error/ErrorPageContent";
import Time from "@/app/components/Time";

export default function ErrorPage(props: {
    error: Error & { digest?: string },
    reset: () => void,
}) {
    return (
        <>
            <Time
                className="mb-8" />

            <ErrorPageContent
                {...props} />
        </>
    );
}