import { cn } from "../../utils/tailwind";
import "./Skeleton.css";

export default function Skeleton(props: {
    className?: string,
    children?: React.ReactNode,
}) {
    return (
        <div
            className={cn("skeleton w-full h-[1em]", props.className)}>
            {props.children}
        </div>
    );
}