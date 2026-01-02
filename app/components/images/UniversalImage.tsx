import { useState } from "react";
import LocalImage from "./LocalImage";
import Button from "../input/Button";
import { LuImageOff } from "react-icons/lu";
import Skeleton from "../skeleton/Skeleton";
import { cn } from "@/app/utils/tailwind";

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function UniversalImage(props: {
    src?: string | Blob,
    alt?: string,
    title?: string,
    className?: string,
    buttonClassName?: string,
    withStates?: boolean,
    onClick?: () => void,
    onReplaceClick?: () => void,
}) {
    const isLocalImage = !!props.src && typeof props.src === "string" && GUID_REGEX.test(props.src);

    if (props.src && typeof props.src === "string" && isLocalImage) {
        return (
            <LocalImage
                className={props.className}
                buttonClassName={props.buttonClassName}
                imageId={props.src}
                onClick={props.onClick}
                withStates={props.withStates}
                onReplaceClick={props.onReplaceClick} />
        );
    }

    return (
        <ExternalImage
            {...props} />
    );
}

function ExternalImage(props: {
    src?: string | Blob,
    alt?: string,
    title?: string,
    className?: string,
    buttonClassName?: string,
    withStates?: boolean,
    onClick?: () => void,
    onReplaceClick?: () => void,
}) {
    const [loadFailed, setLoadFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const includeLoadingState = props.withStates && isLoading;

    if (props.withStates && loadFailed) {
        return (
            <span
                className="rounded-lg border-2 border-outline-variant border-dashed h-64 flex flex-col items-center justify-center gap-3 p-4 text-sm text-on-surface-muted">
                <LuImageOff
                    className="h-10 w-10" />
                <span>Image could not be loaded</span>

                {props.onReplaceClick &&
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={props.onReplaceClick}>
                        Replace
                    </Button>}
            </span>
        );
    }

    if (props.onClick) {
        return (
            <>
                {includeLoadingState &&
                    <ImageSkeleton
                        className={props.className} />}
                <button
                    className={cn(props.buttonClassName, includeLoadingState && "hidden")}
                    onClick={props.onClick}>
                    <img
                        src={props.src}
                        alt={props.alt}
                        title={props.title}
                        className={props.className}
                        onLoad={() => setIsLoading(false)}
                        onError={() => setLoadFailed(true)} />
                </button>
            </>
        );
    }

    return (
        <>
            {includeLoadingState &&
                <ImageSkeleton
                    className={props.className} />}
            <img
                {...props}
                className={cn(props.className, includeLoadingState && "hidden")}
                onLoad={() => setIsLoading(false)}
                onError={() => setLoadFailed(true)} />
        </>
    );
}

function ImageSkeleton(props: {
    className?: string,
}) {
    return (
        <Skeleton
            as="span"
            className={cn(props.className, "block h-64 mx-auto")} />
    );
}