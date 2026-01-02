import { cn } from "@/app/utils/tailwind";

export default function ContentItemListHeading(props: {
    className?: string,
    children?: React.ReactNode,
    as?: "h3" | "h4",
}) {
    const Element = props.as || "h3";

    return (
        <Element
            className={cn("text-sm font-semibold text-on-surface-muted mb-2", props.className)}>
            {props.children}
        </Element>
    );
}