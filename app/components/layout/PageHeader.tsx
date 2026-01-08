import { cn } from "@/app/utils/tailwind";
import UserButton from "./UserButton";

export default function PageHeader(props: {
    className?: string,
    breadcrumbs?: React.ReactNode,
    pageHeading?: React.ReactNode,
    actionButtons?: React.ReactNode,
    smActionButtons?: React.ReactNode,
    fullscreen?: boolean,
}) {
    const hasAnythingLarge = !!props.breadcrumbs ||
        !!props.breadcrumbs ||
        !!props.pageHeading ||
        !!props.actionButtons;

    const hasHeading = !!props.pageHeading;

    return (
        <header
            className={cn(
                props.className,
                !props.fullscreen ? "mb-8" : "mb-2",
                !hasAnythingLarge && !hasHeading && "mb-20 sm:mb-16")}>
            <div
                className={cn(
                    "flex justify-between items-center pr-28 sm:pr-4 pl-4 py-2 bg-surface z-30 h-14 sm:h-auto",
                    !hasAnythingLarge && "sm:hidden justify-end sm:justify-stretch",
                    !props.fullscreen && "scrollable-header fixed top-0 left-0 sm:left-15 right-0")}>
                {props.breadcrumbs}
                <div
                    className="sm:flex hidden gap-2 items-center">
                    {props.actionButtons}
                </div>
            </div>

            {hasHeading &&
                <div
                    className={cn(
                        "flex justify-between items-start w-full px-4",
                        !props.fullscreen && "max-w-4xl pt-20 mx-auto")}>
                    {props.pageHeading}
                    <div
                        className="sm:hidden flex gap-2 items-center mt-1.5">
                        {props.smActionButtons}
                    </div>
                </div>}
        </header>
    );
}