"use client"

import { LuLogOut, LuUser } from "react-icons/lu";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { UserInfo } from "../../types/UserInfo";
import { USER_INFO_KEY } from "../../constants/localStorage";
import { cn } from "../../utils/tailwind";
import Button from "../Button";
import Image from "next/image";

export default function Header(props: {
    className?: string,
    children?: React.ReactNode,
}) {
    const [userInfo] = useLocalStorage<UserInfo | null>(USER_INFO_KEY, null);

    if (!userInfo) {
        return undefined;
    }

    return (
        <header
            className={cn("px-4 py-2 grid grid-cols-[calc(100%-var(--spacing)*12)_auto] items-start pointer-events-none z-10", props.className)}>
            <div
                className="pointer-events-auto">
                {props.children}
            </div>
            <Button
                className="p-1 rounded-full pointer-events-auto justify-self-end"
                popoverTarget="userinfo-popover">
                {userInfo.picture ?
                    <Image
                        className="w-9 h-9 rounded-full"
                        src={userInfo.picture}
                        alt="Profile picture" /> :
                    <div
                        className="w-9 h-9 rounded-full bg-primary grid place-content-center">
                        <LuUser
                            className="text-on-primary w-5 h-5" />
                    </div>}
            </Button>
            <Popover
                userInfo={userInfo} />
        </header>
    );
}

function Popover(props: {
    userInfo: UserInfo,
}) {
    return (
        <article
            className="pointer-events-auto slide-down-popover-transition open:fixed inset-[unset] right-4 top-15 bg-surface-container rounded-xl border border-outline-variant px-4 py-3 w-full max-w-[min(calc(100vw-(var(--spacing)*8)),20rem)]"
            id="userinfo-popover"
            popover="auto">
            <div
                className="flex flex-col">
                <h2
                    className="font-semibold text-lg">
                    {props.userInfo.name}
                </h2>
                <small
                    className="text-on-surface-container-muted mb-1">
                    {props.userInfo.email}
                </small>

                <Button
                    className="self-end"
                    size="sm">
                    <LuLogOut /> Sign out
                </Button>
            </div>
        </article>
    );
}