import { cn } from "../../utils/tailwind";
import "./Skeleton.css";

export default function Skeleton(props: {
    className?: string,
    children?: React.ReactNode,
    as?: "div" | "span",
}) {
    const Element = props.as || "div";

    return (
        <Element
            className={cn("skeleton w-full h-[1em] rounded-sm", props.className)}>
            {props.children}
        </Element>
    );
}