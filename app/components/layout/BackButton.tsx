import { LuChevronLeft } from "react-icons/lu";
import Button from "../Button";
import { cn } from "../../utils/tailwind";

export default function BackButton(props: {
    title: string,
    href: string,
    className?: string,
}) {
    return (
        <Button
            className={cn("-mx-1.5 pl-0.5 mb-1 text-on-surface-muted gap-1", props.className)}
            size="sm"
            href={props.href}>
            <LuChevronLeft className="mb-[1px]" />
            {props.title}
        </Button>
    );
}