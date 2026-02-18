"use client";

import { useRouter } from "next/navigation";
import Button from "../input/Button";
import { useState } from "react";
import { TbDeviceDesktop, TbMoon, TbSun } from "react-icons/tb";
import { cn } from "@/app/utils/tailwind";
import useIsClient from "@/app/hooks/useIsClient";

export default function ThemeSwitcher(props: {
    className?: string,
    isCompact?: boolean,
}) {
    const isClient = useIsClient();

    if (!isClient) {
        return undefined;
    }

    return (
        <Content
            className={props.className}
            isCompact={props.isCompact} />
    );
}

function Content(props: {
    className?: string,
    isCompact?: boolean,
}) {
    const [currentTheme, setCurrentTheme] = useState<string>(
        ((typeof window !== "undefined") ?
            document?.documentElement.getAttribute("data-theme") :
            false) || "system");
    const router = useRouter();

    function setTheme(theme: string) {
        setCurrentTheme(theme);
        document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
        router.refresh();
    };

    const selectedVariant = "primary";
    const deselectedVariant = "secondary";

    return (
        <div
            className={cn("flex gap-2 isolate", props.className)}>
            <Button
                className="flex-1 justify-center"
                variant={currentTheme === "system" ? selectedVariant : deselectedVariant}
                title={props.isCompact ? "System" : undefined}
                size="lg"
                onClick={() => setTheme("system")}>
                <TbDeviceDesktop className="text-lg" /> {!props.isCompact && <span>System</span>}
            </Button>
            <Button
                className="flex-1 justify-center"
                variant={currentTheme === "light" ? selectedVariant : deselectedVariant}
                title={props.isCompact ? "Light" : undefined}
                size="lg"
                onClick={() => setTheme("light")}>
                <TbSun className="text-lg" /> {!props.isCompact && <span>Light</span>}
            </Button>
            <Button
                className="flex-1 justify-center"
                variant={currentTheme === "dark" ? selectedVariant : deselectedVariant}
                title={props.isCompact ? "Dark" : undefined}
                size="lg"
                onClick={() => setTheme("dark")}>
                <TbMoon className="text-lg" /> {!props.isCompact && <span>Dark</span>}
            </Button>
        </div>
    );
}