import { cn } from "../../utils/tailwind";

export default function ContentWrapper(props: {
    as?: "div" | "section" | "article",
    children?: React.ReactNode,
    className?: string,
}) {
    const As = props.as || "div";

    return (
        <As
            className={cn("w-full max-w-4xl px-4 pt-16 mx-auto min-h-dvh flex flex-col", props.className)}>
            {props.children}
        </As>
    );
}