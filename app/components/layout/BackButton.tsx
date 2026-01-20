import { TbChevronLeft } from "react-icons/tb";
import { cn } from "../../utils/tailwind";
import Button from "../input/Button";

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
            <TbChevronLeft className="mb-[1px]" />
            {props.title}
        </Button>
    );
}