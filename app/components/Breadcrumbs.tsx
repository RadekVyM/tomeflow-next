import { LuChevronRight } from "react-icons/lu";
import { cn } from "../utils/tailwind";
import HorizontalScroller from "./HorizontalScroller";
import { Fragment } from "react/jsx-runtime";
import Button from "./input/Button";
import Skeleton from "./skeleton/Skeleton";

export default function Breadcrumbs(props: {
    className?: string,
    locations: Array<{ href: string, title: string } | null>,
}) {
    return (
        <HorizontalScroller
            className={cn("-mx-2", props.className)}
            scrollerClassName="items-center"
            as="nav">
            {props.locations.map((location, index) =>
                <Fragment
                    key={location?.href || index}>
                    {location ? 
                        <Button
                            href={location.href}
                            className="text-on-surface-muted pt-0.5 min-w-max"
                            size="sm">
                            {location.title}
                        </Button> :
                        <Skeleton
                            className="text-sm max-w-15 mx-2" />}

                    {index !== props.locations.length - 1 &&
                        <LuChevronRight
                            className="text-on-surface-muted w-3 h-3 shrink-0" />}
                </Fragment>)}
        </HorizontalScroller>
    );
}