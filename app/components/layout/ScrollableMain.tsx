import { cn } from "@/app/utils/tailwind";

export default function ScrollableMain(props: {
    className?: string,
    children?: React.ReactNode,
}) {
    return (
        <main
            className={cn("flex-1 w-full max-w-4xl px-4 pb-8 mx-auto flex flex-col isolate", props.className)}>
            {props.children}
        </main>
    )
}