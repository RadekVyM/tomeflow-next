import { LuCheck } from "react-icons/lu";
import { cn } from "../utils/tailwind";
import Button from "./Button";

export default function Checkbox(props: {
    className?: string,
    title?: string,
    disabled?: boolean,
    checked: boolean,
    onClick?: () => void,
}) {
    return (
        <Button
            className={cn("p-0", props.className)}
            role="checkbox"
            aria-checked={props.checked}
            size="sm"
            variant="icon-default"
            title={props.title}
            disabled={props.disabled}
            onClick={props.onClick}>
            <div
                className={cn(
                    "border w-5 h-5 rounded-sm grid place-content-center",
                    props.checked ? "bg-primary border-primary" : "bg-surface border-outline")}>
                {props.checked &&
                    <LuCheck
                        className="text-on-primary" />}
            </div>
        </Button>
    );
}