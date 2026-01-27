import { cn } from "@/app/utils/tailwind";

export default function MenuPopover(props: {
    id: string,
    className?: string,
    children?: React.ReactNode,
}) {
    return (
        <article
            className={cn(
                "pointer-events-auto slide-down-popover-transition open:fixed inset-[unset] left-16",
                "bg-surface-container rounded-xl border border-outline-variant px-4 py-3 w-full max-w-[min(calc(100vw-(var(--spacing)*8)),16rem)]",
                props.className)}
            id={props.id}
            popover="auto">
            {props.children}
        </article>
    );
}