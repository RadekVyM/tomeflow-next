import Button from "@/app/components/input/Button";
import { LuPackagePlus } from "react-icons/lu";

export default function NewProjectButtonSkeleton(props: {
    className?: string,
    size?: "sm" | "default",
}) {
    return (
        <Button
            variant={"icon-primary"}
            size={props.size}
            className={props.className}
            disabled>
            <LuPackagePlus />
        </Button>
    );
}