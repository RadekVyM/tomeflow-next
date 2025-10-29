import { LuChevronRight } from "react-icons/lu";
import { cn } from "../utils/tailwind";
import Button from "./Button";
import HorizontalScroller from "./HorizontalScroller";
import { Fragment } from "react/jsx-runtime";

export default function Breadcrumbs(props: {
    className?: string,
    locations: Array<{ href: string, title: string }>,
}) {
    return (
        <HorizontalScroller
            className={cn("mb-2 -mx-2", props.className)}
            scrollerClassName="items-center"
            as="nav">
            {props.locations.map((location, index) =>
                <Fragment
                    key={location.href}>
                    <Button
                        href={location.href}
                        className="text-on-surface-muted pt-0.5 min-w-max"
                        size="sm">
                        {location.title}
                    </Button>

                    {index !== props.locations.length - 1 &&
                        <LuChevronRight
                            className="text-on-surface-muted w-3 h-3 shrink-0" />}
                </Fragment>)}
        </HorizontalScroller>
    );
}