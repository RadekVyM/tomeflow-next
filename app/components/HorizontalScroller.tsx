"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { cn } from "../utils/tailwind";
import { isMobileUserAgent } from "../utils/userAgent";
import Button from "./input/Button";

export default function HorizontalScroller(props: {
    children?: React.ReactNode,
    className?: string,
    scrollerClassName?: string,
    as?: "div" | "section" | "nav"
}) {
    const Element = props.as || "div";
    const scrollViewRef = useRef<HTMLDivElement>(null);
    const [isLeftVisible, setIsLeftVisible] = useState(false);
    const [isRightVisible, setIsRightVisible] = useState(false);
    const isMobile = isMobileUserAgent();

    const onScroll = useCallback(() => {
        if (!scrollViewRef.current) {
            return;
        }

        const maxScrollLeft = scrollViewRef.current.scrollWidth - scrollViewRef.current.clientWidth;
        const tolerance = 1;

        setIsLeftVisible(Math.abs(scrollViewRef.current.scrollLeft) > tolerance);
        setIsRightVisible(Math.abs(scrollViewRef.current.scrollLeft - maxScrollLeft) > tolerance);
    }, [scrollViewRef]);

    useEffect(() => {
        const observer = new ResizeObserver((changes) => {
            for (const change of changes) {
                setIsLeftVisible(change.target.scrollLeft !== 0);
                setIsRightVisible(change.target.scrollLeft !== change.target.scrollWidth - change.target.clientWidth);
            }
        });

        if (scrollViewRef.current) {
            observer.observe(scrollViewRef.current);
        }

        return () => observer.disconnect();
    }, [scrollViewRef]);

    useEffect(() => {
        onScroll();
    }, [onScroll]);

    return (
        <Element
            className={cn("relative max-w-full", props.className)}>
            <div
                ref={scrollViewRef}
                className={cn("flex max-w-full overflow-auto hidden-scrollbar", props.scrollerClassName)}
                onScroll={onScroll}>
                {props.children}
            </div>

            {isLeftVisible &&
                <>
                    <div
                        className="absolute -my-1 -ml-1 left-0 top-0 bottom-0 w-8 bg-linear-to-r from-surface via-surface to-transparent">
                    </div>

                    {!isMobile &&
                        <Button
                            variant="icon-container"
                            size="sm"
                            className="absolute left-0 top-0"
                            onClick={() => scrollViewRef.current?.scrollBy({ left: (scrollViewRef.current?.clientWidth || 0) / -2, behavior: "smooth" })}>
                            <TbChevronLeft
                                className="w-3 h-3" />
                        </Button>}
                </>}

            {isRightVisible &&
                <>
                    <div
                        className="absolute -my-1 -mr-1 right-0 top-0 bottom-0 w-8 bg-linear-to-l from-surface via-surface to-transparent">
                    </div>

                    {!isMobile &&
                        <Button
                            variant="icon-container"
                            size="sm"
                            className="absolute right-0 top-0"
                            onClick={() => scrollViewRef.current?.scrollBy({ left: (scrollViewRef.current?.clientWidth || 0) / 2, behavior: "smooth" })}>
                            <TbChevronRight
                                className="w-3 h-3" />
                        </Button>}
                </>}
        </Element>
    )
}