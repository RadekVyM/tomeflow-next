import { cn } from "@/app/utils/tailwind";

export default function PageHeading(props: {
    children?: React.ReactNode,
    className?: string,
}) {
    return (
        <h2
            className={cn("text-4xl font-semibold text-on-surface line-clamp-3", props.className)}>
            {props.children}
        </h2>
    );
}