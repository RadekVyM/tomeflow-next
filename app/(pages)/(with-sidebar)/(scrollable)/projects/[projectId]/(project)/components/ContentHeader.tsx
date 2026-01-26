import { cn } from "@/app/utils/tailwind";

export default function ContentHeader(props: {
    hasHeading?: boolean,
}) {
    const showHeading = props.hasHeading;

    return (
        <h3
            className={cn("font-semibold text-2xl mb-4", !showHeading && "sr-only", showHeading && "mt-8")}>
            Content
        </h3>
    );
}