import { cn } from "../../utils/tailwind";
import "./Skeleton.css";

export default function Skeleton(props: {
    className?: string,
}) {
    return (
        <div
            className={cn("skeleton w-full", props.className)} />
    );
}