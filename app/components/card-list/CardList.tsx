import { cn } from "@/app/utils/tailwind";

export default function CardList(props: {
    className?: string,
    children?: React.ReactNode,
}) {
    return (
        <ul
            className={cn("grid items-stretch grid-cols-[repeat(auto-fill,_minmax(min(calc(var(--spacing)*56),_100%),_1fr))] gap-3", props.className)}>
            {props.children}
        </ul>
    );
}