import Button from "@/app/components/input/Button";
import { TbPlus } from "react-icons/tb";

export default function NewProjectButtonSkeleton(props: {
    className?: string,
    size?: "sm" | "default",
}) {
    return (
        <Button
            variant="dynamic-primary"
            size={props.size}
            className={props.className}
            disabled>
            <TbPlus /> <span>New project</span>
        </Button>
    );
}