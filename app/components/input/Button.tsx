"use client";

import type { VariantProps } from "class-variance-authority";
import { useRef } from "react";
import Link from "next/link";
import { buttonVariants } from "../variants/buttonVariants";
import { cn } from "@/app/utils/tailwind";
import Tooltip from "../Tooltip";

export default function Button({ className, href, variant, size, disabled, title, ref, shortcutKeys, ...rest }: {
    children: React.ReactNode,
    className?: string,
    shortcutKeys?: string,
    href?: string,
    ref?: React.RefObject<HTMLElement | null>,
} & React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
    const elementRef = useRef<HTMLElement>(null!);

    if (ref) {
        ref.current = elementRef.current;
    }

    return (
        <>
            {href ?
                <Link
                    ref={elementRef as any}
                    aria-label={title}
                    href={href}
                    className={cn(buttonVariants({ variant, size, className }), disabled && "pointer-events-none opacity-50")}
                    children={rest.children} /> :
                <button
                    ref={elementRef as any}
                    aria-label={title}
                    {...rest}
                    disabled={disabled}
                    className={cn(buttonVariants({ variant, size, className }))} />}
            {title &&
                <Tooltip
                    tooltip={title}
                    elementRef={elementRef}
                    shortcutKeys={shortcutKeys} />}
        </>
    );
}