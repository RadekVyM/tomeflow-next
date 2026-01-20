"use client";

import { useEffect } from "react";
import DefaultButton from "../input/DefaultButton";
import { TbRefresh } from "react-icons/tb";

export default function ErrorPageContent(props: {
    error: Error & { digest?: string },
    reset: () => void,
}) {
    useEffect(() => console.error(props.error), [props.error]);

    return (
        <>
            <p
                className="text-xl font-semibold mb-2">
                Something went wrong.
            </p>

            <p
                className="text-on-surface-muted mb-8">
                Please try again later.
            </p>

            <DefaultButton
                variant="container"
                onClick={() => props.reset()}
                icon={TbRefresh}>
                Try again
            </DefaultButton>
        </>
    );
}