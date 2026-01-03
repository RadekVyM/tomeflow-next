import Button from "@/app/components/input/Button";
import { LuPackagePlus } from "react-icons/lu";

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
            <LuPackagePlus /> <span>New project</span>
        </Button>
    );
}