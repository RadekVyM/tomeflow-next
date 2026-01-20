import { TbCheck } from "react-icons/tb";
import { cn } from "../../utils/tailwind";
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
            className={cn("p-0 rounded-xl relative", props.className)}
            role="checkbox"
            aria-checked={props.checked}
            size="sm"
            variant="icon-default"
            title={props.title}
            disabled={props.disabled}
            onClick={props.onClick}>
            <div
                className={cn(
                    "border w-5 h-5 rounded-lg grid place-content-center transition-all duration-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    props.checked ? "bg-primary border-primary" : "bg-surface border-outline")}>
                <TbCheck
                    className={cn("text-on-primary transition-all duration-200", !props.checked && "opacity-0")} />
            </div>
        </Button>
    );
}