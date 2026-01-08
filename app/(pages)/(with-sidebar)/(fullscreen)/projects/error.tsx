"use client";

import ErrorPageLayout from "@/app/components/error/ErrorPageLayout";

export default function ErrorPage(props: {
    error: Error & { digest?: string },
    reset: () => void,
}) {
    return (
        <div
            className="px-4 pt-3.5">
            <ErrorPageLayout
                {...props} />
        </div>
    );
}