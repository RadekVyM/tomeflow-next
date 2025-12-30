import { cn } from "../utils/tailwind";
import LoadingIcon from "./LoadingIcon";

export default function LoadingView(props: {
    className?: string,
}) {
    return (
        <div
            className={cn("grid place-content-center h-full flex-1 text-on-surface-muted", props.className)}>
            <LoadingIcon
                className="w-8 h-8" />
        </div>
    );
}