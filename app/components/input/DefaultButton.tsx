import { IconType } from "react-icons";
import Button, { ButtonProps } from "./Button";
import { cn } from "@/app/utils/tailwind";

export default function DefaultButton(props: {
    icon?: IconType,
} & Omit<ButtonProps, "size">) {
    const { icon, ...rest } = props;
    const Icon = icon;

    return (
        <Button
            {...rest}>
            {Icon && <Icon />}
            <span className={cn("mt-px text-sm", Icon && "mr-1")}>{props.children}</span>
        </Button>
    );
}